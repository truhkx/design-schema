import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';
import { withTheme } from './decorators';

const meta: Meta<typeof Slider> = {
  title: 'Slider/React Native',
  component: Slider,
  decorators: [withTheme()],
  // Only the required props, so each example story below is exactly its `given`.
  args: {
    label: 'Volume',
    name: 'volume',
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

// showValue
export const ShowValueAlways: Story = { args: { showValue: 'always' } };
export const ShowValueHover: Story = { args: { showValue: 'hover' } };
export const ShowValueNever: Story = { args: { showValue: 'never' } };

// Examples from the doc: each renders exactly its `given`.
export const Volume: Story = {
  args: { label: 'Volume', name: 'volume', defaultValue: 30 },
};

export const PriceRange: Story = {
  args: { label: 'Price range', name: 'price', range: true, defaultValue: [20, 80] },
};

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

// States
export const Disabled: Story = { args: { disabled: true, defaultValue: 65 } };

export const WithDescription: Story = {
  args: { description: 'Applies to notification sounds only.' },
};

export const WithError: Story = {
  args: { error: 'Choose a volume above 0.' },
};

export const Required: Story = { args: { required: true } };

export const Invalid: Story = { args: { invalid: true } };

/** The range form: its two thumbs are the whole keyboard and axe surface (the three-focusable rule does not apply). */
export const Keyboard: Story = {
  args: { label: 'Price range', name: 'price', range: true, defaultValue: [20, 80] },
};
