import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

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
    children: (
      <Button
        label="Bold"
        iconOnly
        leadingIcon={
          <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 2h5a3 3 0 010 6H4zM4 8h6a3 3 0 010 6H4z" />
          </svg>
        }
      />
    ),
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
