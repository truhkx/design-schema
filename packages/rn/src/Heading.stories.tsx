import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import { withTheme } from './decorators';

const meta: Meta<typeof Heading> = {
  title: 'Heading/React Native',
  component: Heading,
  decorators: [withTheme()],
  args: {
    level: 2,
    align: 'start',
    children: 'Account settings',
  },
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {};

// level (the default size follows the level: 1→4xl … 6→md)
export const Level1: Story = { args: { level: 1 } };
export const Level2: Story = { args: { level: 2 } };
export const Level3: Story = { args: { level: 3 } };
export const Level4: Story = { args: { level: 4 } };
export const Level5: Story = { args: { level: 5 } };
export const Level6: Story = { args: { level: 6 } };

// size (independent of level)
export const Size4xl: Story = { args: { size: '4xl' } };
export const Size3xl: Story = { args: { size: '3xl' } };
export const Size2xl: Story = { args: { size: '2xl' } };
export const SizeXl: Story = { args: { size: 'xl' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeMd: Story = { args: { size: 'md' } };

// align
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };
