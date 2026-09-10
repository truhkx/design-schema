import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Switch.js';
import './Stack.js';
import type { SwitchLabelPosition } from './Switch.js';

interface SwitchArgs {
  label: string;
  name: string;
  defaultChecked: boolean;
  disabled: boolean;
  description?: string;
  labelPosition: SwitchLabelPosition;
}

const meta: Meta<SwitchArgs> = {
  title: 'Switch/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Email notifications',
    name: '',
    defaultChecked: false,
    disabled: false,
    description: undefined,
    labelPosition: 'start',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-switch
        label=${args.label}
        name=${ifDefined(args.name || undefined)}
        description=${ifDefined(args.description)}
        label-position=${args.labelPosition}
        ?default-checked=${args.defaultChecked}
        ?disabled=${args.disabled}
      ></ds-switch>
    </div>
  `,
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Default: Story = {};

/* labelPosition */
export const LabelPositionStart: Story = { args: { labelPosition: 'start' } };
export const LabelPositionEnd: Story = { args: { labelPosition: 'end' } };

/* boolean states */
export const DefaultCheckedTrue: Story = { args: { defaultChecked: true } };
export const DisabledTrue: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };

export const WithDescription: Story = {
  args: { description: 'Sends a daily summary at 9:00.' },
};

export const SettingsList: Story = {
  render: () => html`
    <ds-stack gap="0" style="inline-size: min(100%, 24rem)">
      <ds-switch label="Email notifications" default-checked></ds-switch>
      <ds-switch label="Push notifications"></ds-switch>
      <ds-switch label="Show archived" description="Includes items archived in the last year."></ds-switch>
    </ds-stack>
  `,
};
