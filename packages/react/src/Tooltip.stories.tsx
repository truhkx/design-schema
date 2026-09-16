import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
import { Icon } from './Icon';
import { Toolbar } from './Toolbar';

const meta: Meta<typeof Tooltip> = {
  title: 'Tooltip/React',
  component: Tooltip,
  args: {
    content: 'Includes archived items',
    children: <Button label="Items" />,
  },
  tags: ['autodocs'],
};

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
export const Open: Story = { args: { open: true } };

/* examples */
export const IconOnlyButtonName: Story = {
  args: {
    content: 'Bold',
    children: <Button label="Bold" iconOnly leadingIcon={<Icon name="list" />} />,
    describes: false,
  },
};

export const ColumnHeaderHint: Story = {
  args: {
    content: 'Includes archived items',
    children: <Button label="Items" variant="ghost" />,
  },
  render: (args) => (
    <table>
      <thead>
        <tr>
          <th scope="col">
            <Tooltip {...args} />
          </th>
        </tr>
      </thead>
    </table>
  ),
};

export const WarmToolbar: Story = {
  args: {
    content: 'Italic',
    children: <Button label="Italic" iconOnly leadingIcon={<Icon name="dash" />} />,
    delay: 'none',
  },
  render: (args) => (
    <Toolbar label="Text formatting">
      <Tooltip content="Bold" describes={false} delay="none">
        <Button label="Bold" iconOnly leadingIcon={<Icon name="list" />} />
      </Tooltip>
      <Tooltip {...args} />
    </Toolbar>
  ),
};

export const BelowTheTrigger: Story = {
  args: {
    content: 'Copy link',
    children: <Button label="Copy link" iconOnly leadingIcon={<Icon name="external" />} />,
    placement: 'bottom',
  },
};

/** Open with its trigger and three focusable triggers in total, for the keyboard gate (Escape hides it, focus stays). */
export const Keyboard: Story = {
  args: { content: 'Bold', open: true },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <Tooltip {...args}>
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
