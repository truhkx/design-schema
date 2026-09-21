import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Tabs.js';
import type { TabsActivation, TabsFit, TabsOrientation, TabsItem } from './Tabs.js';

interface TabsArgs {
  label: string;
  tabs: TabsItem[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  activation?: TabsActivation | undefined;
  orientation?: TabsOrientation | undefined;
  fit?: TabsFit | undefined;
  keepMounted?: boolean | undefined;
}

const TABS: TabsItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: '3' },
  { id: 'files', label: 'Files', icon: 'external' },
  { id: 'settings', label: 'Settings', disabled: true },
];

const meta: Meta<TabsArgs> = {
  title: 'Tabs/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    // The enum props carry an explicit enum argType: the keyboard gate drives `orientation` from
    // the story URL (`?args=orientation:vertical`), and Storybook drops a URL arg whose argType is
    // missing or whose type it cannot map.
    activation: {
      control: 'inline-radio',
      options: ['automatic', 'manual'],
      type: { name: 'enum', value: ['automatic', 'manual'] },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
    },
    fit: { control: 'inline-radio', options: ['start', 'fill'], type: { name: 'enum', value: ['start', 'fill'] } },
    keepMounted: { control: 'boolean' },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
  },
  args: {
    label: 'Project sections',
    tabs: TABS,
    activation: 'automatic',
    orientation: 'horizontal',
    fit: 'start',
    keepMounted: false,
  },
  // One <ds-tab-panel> per entry in `tabs`, id = the tab id, so a story that
  // replaces `tabs` replaces the panels with it and leaves no orphans.
  render: (args) => html`
    <ds-tabs
      label=${args.label}
      .tabs=${args.tabs}
      value=${ifDefined(args.value)}
      default-value=${ifDefined(args.defaultValue)}
      activation=${args.activation ?? 'automatic'}
      orientation=${args.orientation ?? 'horizontal'}
      fit=${args.fit ?? 'start'}
      ?keep-mounted=${args.keepMounted ?? false}
    >
      ${args.tabs.map((tab) => html`<ds-tab-panel id=${tab.id}>${tab.label} panel.</ds-tab-panel>`)}
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
export const FitFill: Story = { args: { fit: 'fill', tabs: TABS.slice(0, 3) } };

/* notable states */
export const KeepMounted: Story = { args: { keepMounted: true } };
export const Controlled: Story = { args: { value: 'activity' } };

/**
 * The tab list with three enabled tabs, for the keyboard gate. Manual activation so
 * Enter/Space selection is observable; `orientation` is read from the story URL
 * (`args=orientation:vertical`) for the Up/Down rules.
 */
export const Keyboard: Story = { args: { activation: 'manual', tabs: TABS.slice(0, 3) } };

/** A tab without a matching `<ds-tab-panel>` is still rendered; its panel region is empty (dev warning). */
export const TabWithoutPanel: Story = {
  args: { defaultValue: 'files' },
  render: (args) => html`
    <ds-tabs
      label=${args.label}
      .tabs=${args.tabs}
      value=${ifDefined(args.value)}
      default-value=${ifDefined(args.defaultValue)}
      activation=${args.activation ?? 'automatic'}
      orientation=${args.orientation ?? 'horizontal'}
      fit=${args.fit ?? 'start'}
      ?keep-mounted=${args.keepMounted ?? false}
    >
      ${args.tabs.slice(0, 2).map((tab) => html`<ds-tab-panel id=${tab.id}>${tab.label} panel.</ds-tab-panel>`)}
    </ds-tabs>
  `,
};

/* examples */
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
