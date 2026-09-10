import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
import { Icon } from './Icon';

const meta = {
  title: 'Tooltip/React',
  component: Tooltip,
  args: {
    content: 'Bold',
    children: <Button label="Bold" />,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* placement */
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

/* delay */
export const DelayDefault: Story = { args: { delay: 'default' } };
export const DelayNone: Story = { args: { delay: 'none' } };

/* notable states */
export const DescribesFalseIconOnly: Story = {
  args: {
    describes: false,
    children: <Button label="Bold" iconOnly leadingIcon={<Icon name="check" inline />} />,
  },
};

/** Open/present with its trigger and at least three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <Tooltip content="Bold">
        <Button label="Bold" autoFocus />
      </Tooltip>
      <Tooltip content="Italic">
        <Button label="Italic" />
      </Tooltip>
      <Tooltip content="Underline">
        <Button label="Underline" />
      </Tooltip>
    </div>
  ),
};
