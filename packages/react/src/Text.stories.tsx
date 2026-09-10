import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta = {
  title: 'Text/React',
  component: Text,
  args: {
    children: 'Use the email you signed up with.',
    size: 'md',
    weight: 'regular',
    tone: 'default',
    align: 'start',
    truncate: false,
    element: 'p',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* size */
export const SizeXs: Story = { args: { size: 'xs' } };
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeXl: Story = { args: { size: 'xl' } };

/* weight */
export const WeightRegular: Story = { args: { weight: 'regular' } };
export const WeightMedium: Story = { args: { weight: 'medium' } };
export const WeightSemibold: Story = { args: { weight: 'semibold' } };
export const WeightBold: Story = { args: { weight: 'bold' } };

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneStrong: Story = { args: { tone: 'strong' } };
export const ToneMuted: Story = { args: { tone: 'muted' } };
export const ToneDanger: Story = { args: { tone: 'danger', children: 'Error: enter an email address like name@example.com.' } };
export const ToneOnAction: Story = {
  args: { tone: 'onAction', children: 'Text on an action background' },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-action-primary-background)', padding: 'var(--space-md)' }}>
        <Story />
      </div>
    ),
  ],
};

/* align */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };

/* element */
export const ElementP: Story = { args: { element: 'p' } };
export const ElementSpan: Story = { args: { element: 'span' } };

/* truncate */
export const Truncate: Story = {
  args: {
    truncate: true,
    children:
      'This sentence is intentionally long so that it overflows the container and is clipped to one line with an ellipsis; the full text is still available in the title attribute.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24ch' }}>
        <Story />
      </div>
    ),
  ],
};
