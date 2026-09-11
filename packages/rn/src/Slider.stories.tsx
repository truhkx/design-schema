import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';
import { withTheme } from './decorators';

const meta: Meta<typeof Slider> = {
  title: 'Slider/React Native',
  component: Slider,
  decorators: [withTheme()],
  args: {
    label: 'Volume',
    name: 'volume',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 40,
    showValue: 'always',
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

// showValue
export const ShowValueAlways: Story = { args: { showValue: 'always' } };
export const ShowValueHover: Story = { args: { showValue: 'hover' } };
export const ShowValueNever: Story = { args: { showValue: 'never' } };

export const Range: Story = {
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    formatValue: (v: number) => `$${v}`,
  },
};

export const WithMarks: Story = {
  args: {
    label: 'Playback speed',
    name: 'speed',
    min: 0.5,
    max: 2,
    step: 0.5,
    snapToMarks: true,
    defaultValue: 1,
    formatValue: (v: number) => `${v}×`,
    marks: [
      { value: 0.5, label: '0.5×' },
      { value: 1, label: '1×' },
      { value: 1.5, label: '1.5×' },
      { value: 2, label: '2×' },
    ],
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 65 } };

export const WithDescription: Story = {
  args: { description: 'Applies to notification sounds only.' },
};

export const WithError: Story = {
  args: { error: 'Choose a volume above 0.' },
};

export const Required: Story = { args: { required: true } };

export const Invalid: Story = { args: { invalid: true } };

/**
 * Slider has no trigger/open state (the "Keyboard" convention for overlay components
 * doesn't map onto it); the docs call for rendering the range form here, whose two
 * thumbs are the whole keyboard/axe-check surface (the three-focusable-children rule
 * does not apply).
 */
export const Keyboard: Story = {
  render: () => (
    <Slider label="Price range" name="price" min={0} max={500} step={10} defaultValue={[100, 350]} range formatValue={(v) => `$${v}`} />
  ),
};
