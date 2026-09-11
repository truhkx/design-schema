import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Switch/React',
  component: Switch,
  args: {
    label: 'Email notifications',
    defaultChecked: false,
    disabled: false,
    labelPosition: 'start',
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* labelPosition */
export const LabelPositionStart: Story = { args: { labelPosition: 'start' } };
export const LabelPositionEnd: Story = { args: { labelPosition: 'end' } };

/* states */
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };
export const WithDescription: Story = {
  args: { description: 'Sends a daily summary at 9:00.' },
};
export const WithName: Story = { args: { name: 'notifications', label: 'Push notifications' } };
export const Controlled: Story = { args: { checked: true } };
