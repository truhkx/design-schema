import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const meta = {
  title: 'Slider/React',
  component: Slider,
  args: {
    label: 'Volume',
    name: 'volume',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 40,
    range: false,
    showValue: 'always',
    disabled: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
    onChangeEnd: { action: 'onChangeEnd' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* showValue */
export const ShowValueAlways: Story = { args: { showValue: 'always' } };
export const ShowValueHover: Story = { args: { showValue: 'hover' } };
export const ShowValueNever: Story = { args: { showValue: 'never' } };

/* range */
export const Range: Story = {
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    range: true,
    defaultValue: [100, 350],
    formatValue: (value: number) => `$${value}`,
  },
};

/* marks */
export const WithMarks: Story = {
  args: {
    label: 'Playback speed',
    name: 'speed',
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 2,
    marks: [
      { value: 0, label: '0.5×' },
      { value: 1, label: '0.75×' },
      { value: 2, label: '1×' },
      { value: 3, label: '1.5×' },
      { value: 4, label: '2×' },
    ],
    formatValue: (value: number) => ['0.5×', '0.75×', '1×', '1.5×', '2×'][value] ?? String(value),
  },
};

/* snapToMarks */
export const SnapToMarks: Story = {
  args: {
    label: 'Playback speed',
    name: 'speed',
    min: 0,
    max: 4,
    step: 1,
    snapToMarks: true,
    defaultValue: 2,
    marks: [
      { value: 0, label: '0.5×' },
      { value: 1, label: '0.75×' },
      { value: 2, label: '1×' },
      { value: 3, label: '1.5×' },
      { value: 4, label: '2×' },
    ],
    formatValue: (value: number) => ['0.5×', '0.75×', '1×', '1.5×', '2×'][value] ?? String(value),
  },
};

/* states */
export const Disabled: Story = { args: { disabled: true } };
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithDescription: Story = {
  args: { description: 'Changes take effect immediately.' },
};
export const WithError: Story = {
  args: { error: 'Volume must be above 10 for notifications to be audible.' },
};

export const Keyboard: Story = {
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    range: true,
    defaultValue: [100, 350],
    formatValue: (value: number) => `$${value}`,
  },
};
