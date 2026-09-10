import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Heading.js';
import type { HeadingAlign, HeadingLevel, HeadingSize } from './Heading.js';

interface HeadingArgs {
  level: HeadingLevel;
  size?: HeadingSize;
  align: HeadingAlign;
  text: string;
}

const meta: Meta<HeadingArgs> = {
  title: 'Heading/Lit',
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: ['1', '2', '3', '4', '5', '6'] },
    size: { control: 'select', options: [undefined, '4xl', '3xl', '2xl', 'xl', 'lg', 'md'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
  args: {
    level: '2',
    size: undefined,
    align: 'start',
    text: 'Account settings',
  },
  render: (args) => html`
    <ds-heading level=${args.level} size=${ifDefined(args.size)} align=${args.align}
      >${args.text}</ds-heading
    >
  `,
};

export default meta;
type Story = StoryObj<HeadingArgs>;

export const Default: Story = {};

/* level (default size follows the level) */
export const Level1: Story = { args: { level: '1' } };
export const Level2: Story = { args: { level: '2' } };
export const Level3: Story = { args: { level: '3' } };
export const Level4: Story = { args: { level: '4' } };
export const Level5: Story = { args: { level: '5' } };
export const Level6: Story = { args: { level: '6' } };

/* size (independent of level) */
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
