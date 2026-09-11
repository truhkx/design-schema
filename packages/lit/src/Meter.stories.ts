import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Meter.js';
import './Stack.js';
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
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    hideValue: { control: 'boolean' },
  },
  args: {
    value: 32,
    min: 0,
    max: 100,
    label: 'Storage used',
    valueText: '3.2 GB of 10 GB',
    tone: 'info',
    hideValue: false,
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-meter
        label=${args.label}
        value=${args.value}
        min=${args.min}
        max=${args.max}
        value-text=${ifDefined(args.valueText)}
        tone=${args.tone}
        ?hide-value=${args.hideValue}
      ></ds-meter>
    </div>
  `,
};

export default meta;
type Story = StoryObj<MeterArgs>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = {
  args: { tone: 'success', label: 'Password strength', value: 4, min: 0, max: 4, valueText: 'Strong' },
};
export const ToneWarning: Story = {
  args: { tone: 'warning', value: 82, valueText: '8.2 GB of 10 GB' },
};
export const ToneDanger: Story = {
  args: { tone: 'danger', value: 95, valueText: '9.5 GB of 10 GB' },
};

/* boolean states */
export const HideValue: Story = { args: { hideValue: true } };

export const PercentOnly: Story = {
  args: { label: 'Battery', value: 64, valueText: undefined },
};

export const CustomRange: Story = {
  args: { label: 'Score', value: 7, min: 0, max: 10, valueText: '7 of 10', tone: 'success' },
};

export const Tones: Story = {
  render: () => html`
    <ds-stack gap="4" style="inline-size: min(100%, 24rem)">
      <ds-meter label="Documents" value="18" value-text="1.8 GB of 10 GB" tone="info"></ds-meter>
      <ds-meter label="Backups" value="40" value-text="4 GB of 10 GB" tone="success"></ds-meter>
      <ds-meter label="Media" value="82" value-text="8.2 GB of 10 GB" tone="warning"></ds-meter>
      <ds-meter label="Mail" value="97" value-text="9.7 GB of 10 GB" tone="danger"></ds-meter>
    </ds-stack>
  `,
};
