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
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
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
    <ds-progress-bar
      label=${args.label}
      value=${ifDefined(args.value)}
      min=${args.min}
      max=${args.max}
      tone=${args.tone}
      announce=${args.announce}
      ?hide-label=${args.hideLabel}
      ?hide-value=${!args.showValue}
      .formatValue=${args.formatValue}
    ></ds-progress-bar>
  `,
};

export default meta;
type Story = StoryObj<ProgressBarArgs>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneDanger: Story = { args: { tone: 'danger' } };

/* announce */
export const AnnounceNone: Story = { args: { announce: 'none' } };
export const AnnounceMilestones: Story = { args: { announce: 'milestones' } };
export const AnnounceComplete: Story = { args: { announce: 'complete' } };

/* examples */
export const Upload: Story = { args: { label: 'Uploading photos', value: 42 } };
export const LongImport: Story = { args: { label: 'Importing contacts', value: 10, announce: 'milestones' } };
export const Finished: Story = { args: { label: 'Export', value: 100, tone: 'success' } };
export const InACard: Story = { args: { label: 'Rendering preview', value: 60, hideLabel: true, showValue: false } };

/* other states */
export const Indeterminate: Story = { args: { value: undefined } };
export const HideLabel: Story = { args: { hideLabel: true } };
export const ShowValueFalse: Story = { args: { showValue: false } };
export const CustomFormatValue: Story = {
  args: {
    label: 'Importing contacts',
    value: 3,
    max: 12,
    formatValue: (value, _min, max) => `${value} of ${max} files`,
  },
};
export const NonZeroMin: Story = { args: { min: 50, max: 150, value: 100 } };

/** The three tones side by side; each is paired with text that says what happened, never colour alone. */
export const Tones: Story = {
  render: () => html`
    <ds-stack gap="loose">
      <ds-progress-bar label="Uploading photos" value="42"></ds-progress-bar>
      <ds-progress-bar label="Import finished" value="100" tone="success"></ds-progress-bar>
      <ds-progress-bar label="Sync failed" value="58" tone="danger"></ds-progress-bar>
    </ds-stack>
  `,
};
