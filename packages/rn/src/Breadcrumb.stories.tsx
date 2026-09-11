import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';
import { withTheme } from './decorators';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Breadcrumb/React Native',
  component: Breadcrumb,
  decorators: [withTheme()],
  args: {
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Breadcrumb' },
    ],
    label: 'Breadcrumb',
    collapse: true,
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

const longTrail = [
  { label: 'Docs', href: '/docs' },
  { label: 'Guides', href: '/docs/guides' },
  { label: 'Forms', href: '/docs/guides/forms' },
  { label: 'Validation', href: '/docs/guides/forms/validation' },
  { label: 'Errors', href: '/docs/guides/forms/validation/errors' },
  { label: 'Summary' },
];

/** More than four items: first, an ellipsis button, and the last two. */
export const Collapsed: Story = { args: { items: longTrail, collapse: true } };

// collapse
export const CollapseFalse: Story = { args: { items: longTrail, collapse: false } };

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Settings', href: '/settings' },
      { label: 'Notifications' },
    ],
  },
};
