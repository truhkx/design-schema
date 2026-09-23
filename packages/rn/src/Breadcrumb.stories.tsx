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

const deepTrail = [
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/docs/components' },
  { label: 'Navigation', href: '/docs/components/navigation' },
  { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
  { label: 'Keyboard' },
];

// collapse
export const CollapseTrue: Story = { args: { collapse: true, items: deepTrail } };

export const CollapseFalse: Story = { args: { collapse: false, items: deepTrail } };

// examples

/** A short trail whose last item is the current page, rendered as text. */
export const SettingsTrail: Story = {
  args: {
    items: [
      { label: 'Settings', href: '/settings' },
      { label: 'Notifications', href: '/settings/notifications' },
      { label: 'Email digest' },
    ],
  },
};

/** A trail of more than four items, folded to the first, an ellipsis and the last two. */
export const DeepTrailCollapsed: Story = {
  args: { collapse: true, items: deepTrail },
};

/** A trail short enough that the ellipsis would only cost the reader a click. */
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

/**
 * A level with no page of its own: it renders as plain text in the trail rather than an
 * empty link, and activating it navigates nowhere.
 */
export const AncestorWithoutHref: Story = {
  args: {
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Reference' },
      { label: 'Tokens', href: '/docs/reference/tokens' },
      { label: 'Color' },
    ],
  },
};

/** A second trail, named so the two navigation landmarks are distinguishable. */
export const SecondBreadcrumbOnAPage: Story = {
  args: {
    label: 'Catalogue breadcrumb',
    items: [
      { label: 'Catalogue', href: '/catalogue' },
      { label: 'Tents' },
    ],
  },
};
