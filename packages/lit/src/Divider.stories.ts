import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Divider.js';
import './Stack.js';
import './Text.js';
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
      .label=${args.label || undefined}
      ?semantic=${args.semantic}
    ></ds-divider>
  `,
};

export default meta;
type Story = StoryObj<DividerArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };

/* A vertical divider stretches to its row, so it sits in a horizontal Stack with align stretch
 * whose siblings give the row its height. */
export const OrientationVertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <ds-stack direction="horizontal" align="stretch" gap="tight">
      <ds-text element="span">Bold Italic</ds-text>
      <ds-divider
        orientation=${args.orientation}
        spacing=${args.spacing}
        .label=${args.label || undefined}
        ?semantic=${args.semantic}
      ></ds-divider>
      <ds-text element="span">Align left</ds-text>
    </ds-stack>
  `,
};

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
export const ToolbarGroups: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <ds-stack direction="horizontal" align="stretch" gap="tight">
      <ds-text element="span">Bold Italic</ds-text>
      <ds-divider
        orientation=${args.orientation}
        spacing=${args.spacing}
        .label=${args.label || undefined}
        ?semantic=${args.semantic}
      ></ds-divider>
      <ds-text element="span">Align left</ds-text>
    </ds-stack>
  `,
};
export const SectionBoundary: Story = { args: { semantic: true, spacing: 'loose' } };
