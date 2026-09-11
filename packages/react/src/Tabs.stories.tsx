import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabPanel, type TabsItem } from './Tabs';

const TABS: TabsItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'settings', label: 'Settings', disabled: true },
];

const panels = [
  <TabPanel key="overview" id="overview">Project overview and key metrics.</TabPanel>,
  <TabPanel key="activity" id="activity">Recent activity across the project.</TabPanel>,
  <TabPanel key="files" id="files">Files attached to the project.</TabPanel>,
  <TabPanel key="settings" id="settings">Project settings.</TabPanel>,
];

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
    children: panels,
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
  args: {
    fit: 'fill',
    tabs: TABS.slice(0, 3),
    children: panels.slice(0, 3),
  },
};

/* notable states */
export const KeepMounted: Story = { args: { keepMounted: true } };
export const Controlled: Story = { args: { value: 'activity' } };

/** Present with its trigger-less tab list and four tabs (three enabled), for the keyboard gate. */
export const Keyboard: Story = {};
