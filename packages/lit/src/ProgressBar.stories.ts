import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ProgressBar.js';
import './Stack.js';
import type { ProgressBarAnnounce, ProgressBarTone } from './ProgressBar.js';

interface ProgressBarArgs {
  label: string;
  value?: number | undefined;
  min: number;
  max: number;
  showValue: boolean;
  hideLabel: boolean;
  tone: ProgressBarTone;
  announce: ProgressBarAnnounce;
}

const meta: Meta<ProgressBarArgs> = {
  title: 'ProgressBar/Lit',
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'success', 'danger'] },
    announce: { control: 'select', options: ['none', 'milestones', 'complete'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    showValue: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
  },
  parameters: {
    actions: { handles: [] },
  },
  args: {
    label: 'Uploading photos',
    value: 42,
    min: 0,
    max: 100,
    showValue: true,
    hideLabel: false,
    tone: 'neutral',
    announce: 'complete',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-progress-bar
        label=${args.label}
        value=${ifDefined(args.value)}
        min=${args.min}
        max=${args.max}
        tone=${args.tone}
        announce=${args.announce}
        ?hide-label=${args.hideLabel}
        ?hide-value=${!args.showValue}
      ></ds-progress-bar>
    </div>
  `,
};

export default meta;
type Story = StoryObj<ProgressBarArgs>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral' } };
export const ToneSuccess: Story = { args: { tone: 'success', value: 100 } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 58 } };

/* announce */
export const AnnounceNone: Story = { args: { announce: 'none' } };
export const AnnounceMilestones: Story = { args: { announce: 'milestones' } };
export const AnnounceComplete: Story = { args: { announce: 'complete' } };

/* value states */
export const Indeterminate: Story = { args: { value: undefined } };
export const Complete: Story = { args: { value: 100, tone: 'success' } };

/* boolean states */
export const HideLabel: Story = { args: { hideLabel: true } };
export const HideValue: Story = { args: { showValue: false } };

export const Tones: Story = {
  render: () => html`
    <ds-stack gap="4" style="inline-size: min(100%, 24rem)">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  `,
};
