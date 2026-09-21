import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Meter.js';
import type { MeterTone } from './Meter.js';

interface MeterArgs {
  value: number;
  min: number;
  max: number;
  label: string;
  valueText?: string | undefined;
  tone: MeterTone;
  hideValue: boolean;
}

const meta: Meta<MeterArgs> = {
  title: 'Meter/Lit',
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    valueText: { control: 'text' },
    hideValue: { control: 'boolean' },
  },
  args: {
    value: 32,
    min: 0,
    max: 100,
    label: 'Storage used',
    tone: 'info',
    hideValue: false,
  },
  render: (args) => html`
    <ds-meter
      label=${args.label}
      value=${args.value}
      min=${args.min}
      max=${args.max}
      value-text=${ifDefined(args.valueText)}
      tone=${args.tone}
      ?hide-value=${args.hideValue}
    ></ds-meter>
  `,
};

export default meta;
type Story = StoryObj<MeterArgs>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning', value: 82 } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 95 } };

/* examples */
export const StorageQuota: Story = {
  args: { label: 'Storage used', value: 32, valueText: '3.2 GB of 10 GB' },
};
export const NearlyFull: Story = {
  args: { label: 'Storage used', value: 95, tone: 'danger', valueText: '9.5 GB of 10 GB' },
};
export const PasswordStrength: Story = {
  args: { label: 'Password strength', value: 3, min: 0, max: 4, valueText: 'Strong', tone: 'success' },
};
export const BarOnly: Story = {
  args: { label: 'Battery', value: 64, hideValue: true },
};

/* notable states */
export const Empty: Story = { args: { value: 0 } };
export const Full: Story = { args: { value: 100 } };
export const AboveMaximum: Story = { args: { value: 150 } };
