import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Divider/React',
  component: Divider,
  args: {
    orientation: 'horizontal',
    semantic: false,
    spacing: 'none',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: { orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', blockSize: '3rem' }}>
        <Story />
      </div>
    ),
  ],
};

/* spacing */
export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingTight: Story = { args: { spacing: 'tight' } };
export const SpacingNormal: Story = { args: { spacing: 'normal' } };
export const SpacingLoose: Story = { args: { spacing: 'loose' } };

/* notable states */
export const Semantic: Story = { args: { semantic: true } };
export const Labelled: Story = { args: { label: 'or' } };
export const LabelledDateHeading: Story = { args: { label: 'Earlier today' } };
