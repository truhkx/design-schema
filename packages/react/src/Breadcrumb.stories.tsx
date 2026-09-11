import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

const shortTrail = [
  { label: 'Settings', href: '/settings' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Email digest' },
];

const longTrail = [
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/docs/components' },
  { label: 'Navigation', href: '/docs/components/navigation' },
  { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
  { label: 'Accessibility', href: '/docs/components/navigation/breadcrumb/accessibility' },
  { label: 'Keyboard' },
];

const meta: Meta<typeof Breadcrumb> = {
  title: 'Breadcrumb/React',
  component: Breadcrumb,
  args: {
    items: shortTrail,
    label: 'Breadcrumb',
    collapse: true,
  },
  argTypes: {
    onNavigate: { action: 'onNavigate' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* collapse */
export const Collapsed: Story = { args: { items: longTrail, collapse: true } };
export const NotCollapsed: Story = { args: { items: longTrail, collapse: false } };

/* other props */
export const CustomLabel: Story = { args: { label: 'Document location' } };
export const TwoLevels: Story = {
  args: { items: [{ label: 'Catalogue', href: '/catalogue' }, { label: 'Chairs' }] },
};
