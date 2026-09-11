import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'ProgressBar/React',
  component: ProgressBar,
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
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral' } };
export const ToneSuccess: Story = { args: { tone: 'success', value: 100 } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 58 } };

/* announce */
export const AnnounceNone: Story = { args: { announce: 'none' } };
export const AnnounceMilestones: Story = { args: { announce: 'milestones' } };
export const AnnounceComplete: Story = { args: { announce: 'complete' } };

/* other states */
export const Indeterminate: Story = { args: { value: undefined } };
export const HiddenLabel: Story = { args: { hideLabel: true } };
export const HiddenValue: Story = { args: { showValue: false } };
export const CustomFormatValue: Story = {
  args: {
    label: 'Importing contacts',
    value: 3,
    max: 12,
    formatValue: (value, _min, max) => `${value} of ${max} files`,
  },
};
export const CustomRange: Story = { args: { min: 0, max: 10, value: 7 } };
export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100, tone: 'success' } };
