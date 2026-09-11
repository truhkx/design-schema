import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabPanel } from './Tabs';
import type { TabsTab } from './Tabs';
import { Text } from './Text';
import { withTheme } from './decorators';

const TABS: TabsTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'settings', label: 'Settings', disabled: true },
];

const meta: Meta<typeof Tabs> = {
  title: 'Tabs/React Native',
  component: Tabs,
  decorators: [withTheme()],
  args: {
    label: 'Project sections',
    tabs: TABS,
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabPanel id="overview">
        <Text>Summary of the project's health and recent activity.</Text>
      </TabPanel>
      <TabPanel id="activity">
        <Text>A log of recent changes.</Text>
      </TabPanel>
      <TabPanel id="files">
        <Text>The project's file tree.</Text>
      </TabPanel>
      <TabPanel id="settings">
        <Text>Project settings.</Text>
      </TabPanel>
    </Tabs>
  ),
};

// activation
export const ActivationAutomatic: Story = { ...Default, args: { activation: 'automatic' } };
export const ActivationManual: Story = { ...Default, args: { activation: 'manual' } };

// orientation
export const OrientationHorizontal: Story = { ...Default, args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { ...Default, args: { orientation: 'vertical' } };

// fit
export const FitStart: Story = { ...Default, args: { fit: 'start' } };
export const FitFill: Story = { ...Default, args: { fit: 'fill' } };

// notable states
export const KeepMounted: Story = { ...Default, args: { keepMounted: true } };

export const WithOverrides: Story = {
  ...Default,
  args: { overrides: { radius: 'radius.full', indicatorThickness: 'border.width.thin' } },
};

/** At least three focusable tabs, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = { ...Default };
