import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Tabs.js';
import type { TabsActivation, TabsFit, TabsOrientation, TabsTab } from './Tabs.js';

interface TabsArgs {
  label: string;
  tabs: TabsTab[];
  value?: string;
  defaultValue?: string;
  activation: TabsActivation;
  orientation: TabsOrientation;
  fit: TabsFit;
  keepMounted: boolean;
}

const TABS: TabsTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'members', label: 'Members', disabled: true },
];

const PANEL_CONTENT: Record<string, string> = {
  overview: 'A summary of the project: status, owner and recent changes.',
  activity: 'A chronological feed of comments, edits and status changes.',
  files: 'Every file attached to this project, newest first.',
  members: 'The people with access to this project and their roles.',
};

const meta: Meta<TabsArgs> = {
  title: 'Tabs/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    activation: { control: 'select', options: ['automatic', 'manual'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    fit: { control: 'select', options: ['start', 'fill'] },
    keepMounted: { control: 'boolean' },
  },
  args: {
    label: 'Project sections',
    tabs: TABS,
    value: undefined,
    defaultValue: undefined,
    activation: 'automatic',
    orientation: 'horizontal',
    fit: 'start',
    keepMounted: false,
  },
  render: (args) => html`
    <ds-tabs
      label=${args.label}
      .tabs=${args.tabs}
      value=${ifDefined(args.value)}
      default-value=${ifDefined(args.defaultValue)}
      activation=${args.activation}
      orientation=${args.orientation}
      fit=${args.fit}
      ?keep-mounted=${args.keepMounted}
    >
      ${args.tabs.map((tab) => html`<ds-tab-panel id=${tab.id}>${PANEL_CONTENT[tab.id] ?? tab.label}</ds-tab-panel>`)}
    </ds-tabs>
  `,
};

export default meta;
type Story = StoryObj<TabsArgs>;

export const Default: Story = {};

/* activation */
export const ActivationAutomatic: Story = { args: { activation: 'automatic' } };
export const ActivationManual: Story = { args: { activation: 'manual' } };

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

/* fit */
export const FitStart: Story = { args: { fit: 'start' } };
export const FitFill: Story = { args: { fit: 'fill' } };

export const KeepMountedTrue: Story = { args: { keepMounted: true } };

export const WithDefaultValue: Story = { args: { defaultValue: 'activity' } };

/**
 * Renders with its trigger-less tab list open and at least three focusable
 * (enabled) tabs so the keyboard gate can verify arrow navigation, wrapping,
 * Home/End, Tab-out and, under manual activation, Enter/Space selection.
 */
export const Keyboard: Story = { args: { tabs: TABS, activation: 'manual' } };
