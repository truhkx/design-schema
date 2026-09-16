import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
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

const divider = (args: DividerArgs): TemplateResult => html`
  <ds-divider
    orientation=${args.orientation}
    spacing=${args.spacing}
    .label=${args.label || undefined}
    ?semantic=${args.semantic}
  ></ds-divider>
`;

/* A vertical divider stretches to the height of the row it sits in. */
const inRow = (args: DividerArgs): TemplateResult => html`
  <ds-stack direction="horizontal" gap="normal" align="stretch">
    <ds-text element="span">Bold</ds-text>
    <ds-text element="span">Italic</ds-text>
    ${divider(args)}
    <ds-text element="span">Align left</ds-text>
    <ds-text element="span">Align right</ds-text>
  </ds-stack>
`;

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
  render: divider,
};

export default meta;
type Story = StoryObj<DividerArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' }, render: inRow };

/* spacing */
export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingTight: Story = { args: { spacing: 'tight' } };
export const SpacingNormal: Story = { args: { spacing: 'normal' } };
export const SpacingLoose: Story = { args: { spacing: 'loose' } };

/* notable states */
export const Labelled: Story = { args: { label: 'or' } };
export const Semantic: Story = { args: { semantic: true } };

/* examples */
export const OrBetweenAlternatives: Story = { args: { label: 'or', spacing: 'normal' } };
export const ListFurniture: Story = { args: { orientation: 'horizontal' } };
export const ToolbarGroups: Story = { args: { orientation: 'vertical' }, render: inRow };
export const SectionBoundary: Story = { args: { semantic: true, spacing: 'loose' } };
