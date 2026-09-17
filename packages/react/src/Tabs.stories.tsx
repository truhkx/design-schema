import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { Tabs, TabPanel, type TabsItem } from './Tabs';

const TABS: TabsItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'settings', label: 'Settings', disabled: true },
];

/** One TabPanel per tab, matching ids. */
function panelsFor(tabs: TabsItem[]): ReactElement[] {
  return tabs.map((tab) => (
    <TabPanel key={tab.id} id={tab.id}>
      {tab.label} panel.
    </TabPanel>
  ));
}

const meta: Meta<typeof Tabs> = {
  title: 'Tabs/React',
  component: Tabs,
  args: {
    tabs: TABS,
    label: 'Project sections',
    activation: 'automatic',
    orientation: 'horizontal',
    fit: 'start',
    keepMounted: false,
    children: panelsFor(TABS),
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* activation */
export const ActivationAutomatic: Story = { args: { activation: 'automatic' } };
export const ActivationManual: Story = { args: { activation: 'manual' } };

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

/* fit */
export const FitStart: Story = { args: { fit: 'start' } };
export const FitFill: Story = {
  args: { fit: 'fill', tabs: TABS.slice(0, 3), children: panelsFor(TABS.slice(0, 3)) },
};

/* notable states */
export const KeepMounted: Story = { args: { keepMounted: true } };
export const Controlled: Story = { args: { value: 'activity' } };

/** Manual activation over three enabled tabs; takes `orientation` from its args (story URL). */
export const Keyboard: Story = {
  args: { activation: 'manual', tabs: TABS.slice(0, 3), children: panelsFor(TABS.slice(0, 3)) },
};

/** A tab without a matching TabPanel is still rendered; its panel region is empty (dev warning). */
export const TabWithoutPanel: Story = { args: { defaultValue: 'files', children: panelsFor(TABS.slice(0, 2)) } };

/* examples */
const ACCOUNT: TabsItem[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'billing', label: 'Billing' },
  { id: 'security', label: 'Security' },
];
export const AccountSections: Story = {
  args: { label: 'Account sections', tabs: ACCOUNT, children: panelsFor(ACCOUNT) },
};

const REPORT: TabsItem[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Details' },
];
export const ManualActivationForExpensivePanels: Story = {
  args: { label: 'Report sections', tabs: REPORT, activation: 'manual', children: panelsFor(REPORT) },
};

const SETTINGS: TabsItem[] = [
  { id: 'general', label: 'General' },
  { id: 'members', label: 'Members' },
];
export const VerticalTabsBesideTheirPanels: Story = {
  args: { label: 'Settings sections', tabs: SETTINGS, orientation: 'vertical', children: panelsFor(SETTINGS) },
};

const INBOX: TabsItem[] = [
  { id: 'inbox', label: 'Inbox', badge: '3' },
  { id: 'archive', label: 'Archive' },
];
export const FilledTabsWithABadge: Story = {
  args: { label: 'Inbox sections', tabs: INBOX, fit: 'fill', keepMounted: true, children: panelsFor(INBOX) },
};
