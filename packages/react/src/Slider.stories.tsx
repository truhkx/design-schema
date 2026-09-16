import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Slider/React',
  component: Slider,
  tags: ['autodocs'],
  args: {
    label: 'Volume',
    name: 'volume',
    defaultValue: 40,
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* showValue */
export const ShowValueAlways: Story = { args: { showValue: 'always' } };
export const ShowValueHover: Story = { args: { showValue: 'hover' } };
export const ShowValueNever: Story = { args: { showValue: 'never' } };

/* examples */
export const Volume: Story = { args: { label: 'Volume', name: 'volume', defaultValue: 30 } };
export const PriceRange: Story = { args: { label: 'Price range', name: 'price', range: true, defaultValue: [20, 80] } };
export const EffortWithMarks: Story = {
  args: {
    label: 'Effort',
    name: 'effort',
    min: 1,
    max: 5,
    marks: [
      { value: 1, label: 'Low' },
      { value: 3, label: 'Medium' },
      { value: 5, label: 'High' },
    ],
    snapToMarks: true,
  },
};
export const PairedWithANumberInput: Story = {
  args: { label: 'Zoom', name: 'zoom', min: 50, max: 200, step: 10, defaultValue: 100, showValue: 'never' },
};

/* states */
export const Disabled: Story = { args: { disabled: true } };
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithDescription: Story = { args: { description: 'Applies to all notifications.' } };
export const WithError: Story = { args: { error: 'Fix this before continuing.' } };

/* keyboard: the range form — two thumbs, each a tab stop */
export const Keyboard: Story = {
  args: { label: 'Price range', name: 'price', range: true, defaultValue: [20, 80] },
};
