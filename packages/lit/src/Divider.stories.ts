import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Divider.js';
import type { DividerOrientation, DividerSpacing } from './Divider.js';

interface DividerArgs {
  orientation: DividerOrientation;
  label: string;
  semantic: boolean;
  spacing: DividerSpacing;
}

const meta: Meta<DividerArgs> = {
  title: 'Divider/Lit',
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    spacing: { control: 'select', options: ['none', 'tight', 'normal', 'loose'] },
    semantic: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    orientation: 'horizontal',
    label: '',
    semantic: false,
    spacing: 'none',
  },
  render: (args) => html`
    <ds-divider
      orientation=${args.orientation}
      spacing=${args.spacing}
      label=${args.label || undefined}
      ?semantic=${args.semantic}
    ></ds-divider>
  `,
};

export default meta;
type Story = StoryObj<DividerArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <div style="display: flex; align-items: center; gap: var(--space-md);">
      <span>Left</span>
      <ds-divider
        orientation=${args.orientation}
        spacing=${args.spacing}
        ?semantic=${args.semantic}
        style="block-size: var(--space-8);"
      ></ds-divider>
      <span>Right</span>
    </div>
  `,
};

/* spacing */
export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingTight: Story = { args: { spacing: 'tight' } };
export const SpacingNormal: Story = { args: { spacing: 'normal' } };
export const SpacingLoose: Story = { args: { spacing: 'loose' } };

/* label: a labelled divider becomes semantic and reads its text */
export const Labelled: Story = { args: { label: 'or' } };

/* semantic without a label: a real section boundary a screen-reader user should hear */
export const Semantic: Story = { args: { semantic: true } };
