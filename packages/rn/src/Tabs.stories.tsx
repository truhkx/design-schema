import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabPanel } from './Tabs';
import type { TabsItem, TabsProps } from './Tabs';
import { Text } from './Text';
import { withTheme } from './decorators';

const TABS: TabsItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'settings', label: 'Settings', disabled: true },
];

/** One TabPanel per tab, matching ids — the examples' `children`. */
function panelsFor(tabs: TabsItem[]): React.JSX.Element[] {
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
export const FitFill: Story = { args: { fit: 'fill', tabs: TABS.slice(0, 3) } };

// notable states
export const KeepMounted: Story = { args: { keepMounted: true, tabs: TABS.slice(0, 2) } };

/** Controlled: the story owns `value`, starting on `activity`, and follows `onChange`. */
export const Controlled: Story = {
  args: { value: 'activity' },
  render: function ControlledTabs(args: TabsProps) {
    const [value, setValue] = React.useState(args.value);
    return (
      <Tabs
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      >
        {panelsFor(args.tabs)}
      </Tabs>
    );
  },
};

/** One tab (`files`) has no TabPanel: it still renders, its panel region is empty, and a dev warning fires. */
export const TabWithoutPanel: Story = {
  render: (args: TabsProps) => <Tabs {...args}>{panelsFor(args.tabs.filter((tab) => tab.id !== 'files'))}</Tabs>,
};

export const WithOverrides: Story = {
  args: { overrides: { radius: 'radius.md', tabPaddingInline: 'space.lg' } },
};

/**
 * `activation: manual` with three enabled tabs, for the axe gate and manual keyboard checks on
 * react-native-web; `orientation` comes from the args so the vertical rules run against it too.
 */
export const Keyboard: Story = {
  args: {
    activation: 'manual',
    orientation: 'horizontal',
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'activity', label: 'Activity', badge: '3' },
      { id: 'files', label: 'Files' },
    ],
  },
  // Explicit enum argTypes: without them Storybook drops these URL args and the gate tests the defaults.
  argTypes: {
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    fit: { control: 'inline-radio', options: ['start', 'fill'] },
  },
};

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
