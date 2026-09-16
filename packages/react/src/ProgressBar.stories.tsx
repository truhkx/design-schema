import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'ProgressBar/React',
  component: ProgressBar,
  tags: ['autodocs'],
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
type Story = StoryObj<typeof meta>;

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
