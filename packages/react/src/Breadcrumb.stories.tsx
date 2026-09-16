import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Breadcrumb/React',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Settings', href: '/settings' },
      { label: 'Notifications', href: '/settings/notifications' },
      { label: 'Email digest' },
    ],
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
export const CollapseTrue: Story = {
  args: {
    collapse: true,
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
      { label: 'Keyboard' },
    ],
  },
};
export const CollapseFalse: Story = {
  args: {
    collapse: false,
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
      { label: 'Keyboard' },
    ],
  },
};

/* examples */
export const SettingsTrail: Story = {
  args: {
    items: [
      { label: 'Settings', href: '/settings' },
      { label: 'Notifications', href: '/settings/notifications' },
      { label: 'Email digest' },
    ],
  },
};
export const DeepTrailCollapsed: Story = {
  args: {
    collapse: true,
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
      { label: 'Keyboard' },
    ],
  },
};
export const AlwaysInFull: Story = {
  args: {
    collapse: false,
    items: [
      { label: 'Catalogue', href: '/catalogue' },
      { label: 'Outdoor', href: '/catalogue/outdoor' },
      { label: 'Tents' },
    ],
  },
};
export const SecondBreadcrumbOnAPage: Story = {
  args: {
    label: 'Catalogue breadcrumb',
    items: [{ label: 'Catalogue', href: '/catalogue' }, { label: 'Tents' }],
  },
};

/* notable states */
export const AncestorWithoutHref: Story = {
  args: {
    items: [{ label: 'Docs', href: '/docs' }, { label: 'Guides' }, { label: 'Theming' }],
  },
};
