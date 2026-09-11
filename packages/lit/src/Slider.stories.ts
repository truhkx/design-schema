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
  value?: SliderValue | undefined;
  defaultValue?: SliderValue | undefined;
  range: boolean;
  showValue: SliderShowValue;
  marks?: SliderMark[] | undefined;
  disabled: boolean;
  description?: string | undefined;
  error?: string | undefined;
}

const PRICE_MARKS: SliderMark[] = [
  { value: 0, label: 'Min' },
  { value: 250, label: '$250' },
  { value: 500, label: 'Max' },
];

const meta: Meta<SliderArgs> = {
  title: 'Slider/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'change-end'] },
  },
  argTypes: {
    showValue: { control: 'select', options: ['always', 'hover', 'never'] },
    range: { control: 'boolean' },
    disabled: { control: 'boolean' },
    snapToMarks: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Volume',
    name: 'volume',
    min: 0,
    max: 100,
    step: 1,
    snapToMarks: false,
    required: false,
    value: undefined,
    defaultValue: undefined,
    range: false,
    showValue: 'always',
    marks: undefined,
    disabled: false,
    description: undefined,
    error: undefined,
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-slider
        label=${args.label}
        name=${args.name}
        min=${args.min}
        max=${args.max}
        step=${args.step}
        ?snapToMarks=${args.snapToMarks}
        ?required=${args.required}
        .value=${args.value}
        .defaultValue=${args.defaultValue}
        ?range=${args.range}
        show-value=${args.showValue}
        .marks=${args.marks ?? []}
        ?disabled=${args.disabled}
        description=${ifDefined(args.description)}
        error=${ifDefined(args.error)}
      ></ds-slider>
    </div>
  `,
};

export default meta;
type Story = StoryObj<SliderArgs>;

export const Default: Story = {};

/* showValue */
export const ShowValueAlways: Story = { args: { showValue: 'always', defaultValue: 40 } };
export const ShowValueHover: Story = { args: { showValue: 'hover', defaultValue: 40 } };
export const ShowValueNever: Story = { args: { showValue: 'never', defaultValue: 40 } };

export const Range: Story = {
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
  },
};

export const Marks: Story = {
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    marks: PRICE_MARKS,
  },
};

export const WithDescription: Story = {
  args: { description: 'Drag or use arrow keys to adjust.', defaultValue: 30 },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 60 } };

export const Required: Story = { args: { required: true } };

export const SnapToMarksStory: Story = {
  name: 'SnapToMarks',
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    marks: PRICE_MARKS,
    snapToMarks: true,
  },
};

export const ErrorState: Story = {
  args: { error: 'Fix this before continuing.', defaultValue: 10 },
};

/**
 * Renders a range slider (its maximum of two thumbs, each its own tab stop)
 * with marks, so the keyboard gate can verify arrows, Page Up/Down, Home/End
 * and Tab moving between thumbs.
 */
export const Keyboard: Story = {
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    range: true,
    marks: PRICE_MARKS,
  },
};
