import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabPanel } from './Tabs';
import type { TabsProps, TabsTab } from './Tabs';
import { Text } from './Text';
import { withTheme } from './decorators';

const TABS: TabsTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'settings', label: 'Settings', disabled: true },
];

/** One TabPanel per tab, matching ids — the examples' `children`. */
function panelsFor(tabs: TabsTab[]): React.JSX.Element[] {
  return tabs.map((tab) => (
    <TabPanel key={tab.id} id={tab.id}>
      <Text>{`${tab.label} panel.`}</Text>
    </TabPanel>
  ));
}

const meta: Meta<typeof Tabs> = {
  title: 'Tabs/React Native',
  component: Tabs,
  decorators: [withTheme()],
  args: {
    label: 'Project sections',
    tabs: TABS,
  },
  render: (args: TabsProps) => <Tabs {...args}>{panelsFor(args.tabs)}</Tabs>,
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};

// activation
export const ActivationAutomatic: Story = { args: { activation: 'automatic' } };
export const ActivationManual: Story = { args: { activation: 'manual' } };

// orientation
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

// fit
export const FitStart: Story = { args: { fit: 'start' } };
export const FitFill: Story = { args: { fit: 'fill' } };

// notable states
export const KeepMounted: Story = { args: { keepMounted: true } };

export const WithOverrides: Story = {
  args: { overrides: { radius: 'radius.md', tabPaddingInline: 'space.lg' } },
};

/** At least three focusable tabs, for the axe gate and manual keyboard checks on react-native-web; accepts `orientation` as an arg. */
export const Keyboard: Story = { args: { orientation: 'horizontal' } };

// examples
export const AccountSections: Story = {
  args: {
    label: 'Account sections',
    tabs: [
      { id: 'profile', label: 'Profile' },
      { id: 'billing', label: 'Billing' },
      { id: 'security', label: 'Security' },
    ],
  },
};

export const ManualActivationForExpensivePanels: Story = {
  args: {
    label: 'Report sections',
    tabs: [
      { id: 'summary', label: 'Summary' },
      { id: 'details', label: 'Details' },
    ],
    activation: 'manual',
  },
};

export const VerticalTabsBesideTheirPanels: Story = {
  args: {
    label: 'Settings sections',
    tabs: [
      { id: 'general', label: 'General' },
      { id: 'members', label: 'Members' },
    ],
    orientation: 'vertical',
  },
};

export const FilledTabsWithABadge: Story = {
  args: {
    label: 'Inbox sections',
    tabs: [
      { id: 'inbox', label: 'Inbox', badge: '3' },
      { id: 'archive', label: 'Archive' },
    ],
    fit: 'fill',
    keepMounted: true,
  },
};
