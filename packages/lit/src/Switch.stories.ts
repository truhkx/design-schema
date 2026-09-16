import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Switch.js';
import type { SwitchLabelPosition } from './Switch.js';

interface SwitchArgs {
  label: string;
  name: string;
  defaultChecked: boolean;
  disabled: boolean;
  description?: string | undefined;
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
    <ds-switch
      label=${args.label}
      name=${ifDefined(args.name || undefined)}
      description=${ifDefined(args.description)}
      label-position=${args.labelPosition}
      ?default-checked=${args.defaultChecked}
      ?disabled=${args.disabled}
    ></ds-switch>
  `,
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Default: Story = {};

/* labelPosition */
export const LabelPositionStart: Story = { args: { labelPosition: 'start' } };
export const LabelPositionEnd: Story = { args: { labelPosition: 'end' } };

/* states */
export const DefaultCheckedTrue: Story = { args: { defaultChecked: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };

/* examples */
export const SettingsRow: Story = {
  args: { label: 'Email notifications', labelPosition: 'start' },
};

export const WithDescription: Story = {
  args: { label: 'Daily summary', description: 'Sends a daily summary at 9:00.' },
};

export const CheckboxAligned: Story = {
  args: { label: 'Show archived', labelPosition: 'end' },
};

export const Disabled: Story = {
  args: { label: 'Two-factor authentication', disabled: true },
};
