import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';
import { withTheme } from './decorators';

const meta: Meta<typeof ProgressBar> = {
  title: 'ProgressBar/React Native',
  component: ProgressBar,
  decorators: [withTheme()],
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
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};

// tone
export const ToneNeutral: Story = { args: { tone: 'neutral' } };
export const ToneSuccess: Story = { args: { tone: 'success', value: 100, label: 'Photos uploaded' } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 58, label: 'Upload failed' } };

// announce
export const AnnounceNone: Story = { args: { announce: 'none' } };
export const AnnounceMilestones: Story = { args: { announce: 'milestones' } };
export const AnnounceComplete: Story = { args: { announce: 'complete' } };

/** No `value` — the end is unknown yet. Sweeps continuously and reports `aria-busy` via `accessibilityState`. */
export const Indeterminate: Story = { args: { value: undefined } };

export const HideLabel: Story = { args: { hideLabel: true } };

export const HideValue: Story = { args: { showValue: false } };

// examples

/** A determinate bar with the value text beside the label. */
export const Upload: Story = { args: { label: 'Uploading photos', value: 42 } };

/** A long task that announces every 25%, for a user who may leave and come back. */
export const LongImport: Story = { args: { label: 'Importing contacts', value: 10, announce: 'milestones' } };

/** A completed bar recolored to success, with the text that says so beside it. */
export const Finished: Story = { args: { label: 'Export', value: 100, tone: 'success' } };

/** A bar whose Card heading already says what is happening, so the label is hidden and the value left off. */
export const InACard: Story = { args: { label: 'Rendering preview', value: 60, hideLabel: true, showValue: false } };

/** `formatValue` renders units other than a percentage. */
export const FormatValue: Story = {
  args: {
    label: 'Importing contacts',
    value: 3,
    min: 0,
    max: 12,
    formatValue: (value: number, _min: number, max: number) => `${value} of ${max} files`,
  },
};
