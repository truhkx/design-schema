import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Heading/React',
  component: Heading,
  args: {
    level: '2',
    children: 'Account settings',
    align: 'start',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* level (size defaults per level) */
export const Level1: Story = { args: { level: '1' } };
export const Level2: Story = { args: { level: '2' } };
export const Level3: Story = { args: { level: '3' } };
export const Level4: Story = { args: { level: '4' } };
export const Level5: Story = { args: { level: '5' } };
export const Level6: Story = { args: { level: '6' } };

/* size, decoupled from level */
export const Size4xl: Story = { args: { size: '4xl' } };
export const Size3xl: Story = { args: { size: '3xl' } };
export const Size2xl: Story = { args: { size: '2xl' } };
export const SizeXl: Story = { args: { size: 'xl' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* align */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };
