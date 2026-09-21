import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Slider.js';
import type { SliderMark, SliderShowValue, SliderValue } from './Slider.js';

interface SliderArgs {
  label: string;
  name: string;
  min: number;
  max: number;
  step: number;
  snapToMarks: boolean;
  required: boolean;
  invalid: boolean;
  value?: SliderValue | undefined;
  defaultValue?: SliderValue | undefined;
  range: boolean;
  formatValue?: ((value: number) => string) | undefined;
  showValue: SliderShowValue;
  marks?: SliderMark[] | undefined;
  disabled: boolean;
  description?: string | undefined;
  error?: string | undefined;
}

const meta: Meta<SliderArgs> = {
  title: 'Slider/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'change-end'] },
  },
  argTypes: {
    showValue: { control: 'inline-radio', options: ['always', 'hover', 'never'] },
    range: { control: 'boolean' },
    snapToMarks: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Volume',
    name: 'volume',
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    snapToMarks: false,
    required: false,
    invalid: false,
    range: false,
    showValue: 'always',
    disabled: false,
  },
  render: (args) => html`
    <ds-slider
      label=${args.label}
      name=${args.name}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      ?snap-to-marks=${args.snapToMarks}
      ?required=${args.required}
      ?invalid=${args.invalid}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      ?range=${args.range}
      .formatValue=${args.formatValue}
      show-value=${args.showValue}
      .marks=${args.marks}
      ?disabled=${args.disabled}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
    ></ds-slider>
  `,
};

export default meta;
type Story = StoryObj<SliderArgs>;

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
