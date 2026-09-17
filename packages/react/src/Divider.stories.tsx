import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Divider> = {
  title: 'Divider/React',
  component: Divider,
  tags: ['autodocs'],
  args: {
    orientation: 'horizontal',
    semantic: false,
    spacing: 'none',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* A vertical divider stretches to its row, so it sits in a horizontal Stack with align stretch whose siblings give the row its height. */
const inRow: NonNullable<Story['decorators']> = [
  (Story) => (
    <Stack direction="horizontal" align="stretch" gap="tight">
      <Text>Bold Italic</Text>
      <Story />
      <Text>Align left</Text>
    </Stack>
  ),
];

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' }, decorators: inRow };

/* spacing */
export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingTight: Story = { args: { spacing: 'tight' } };
export const SpacingNormal: Story = { args: { spacing: 'normal' } };
export const SpacingLoose: Story = { args: { spacing: 'loose' } };

/* notable states */
export const Semantic: Story = { args: { semantic: true } };
export const Labelled: Story = { args: { label: 'or' } };

/* examples */
export const OrBetweenAlternatives: Story = { args: { label: 'or', spacing: 'normal' } };
export const ListFurniture: Story = { args: { orientation: 'horizontal' } };
export const ToolbarGroups: Story = { args: { orientation: 'vertical' }, decorators: inRow };
export const SectionBoundary: Story = { args: { semantic: true, spacing: 'loose' } };
