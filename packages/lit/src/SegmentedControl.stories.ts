import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './SegmentedControl.js';
import type { SegmentedControlOption, SegmentedControlSize } from './SegmentedControl.js';

interface SegmentedControlArgs {
  label: string;
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  iconOnly: boolean;
  size: SegmentedControlSize;
  fill: boolean;
}

const OPTIONS: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', disabled: true },
];

const KEYBOARD_OPTIONS: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year', disabled: true },
];

const ICON_OPTIONS: SegmentedControlOption[] = [
  { value: 'previous', label: 'Previous', icon: 'chevron-left' },
  { value: 'current', label: 'Current', icon: 'dash' },
  { value: 'next', label: 'Next', icon: 'chevron-right' },
];

const meta: Meta<SegmentedControlArgs> = {
  title: 'SegmentedControl/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    iconOnly: { control: 'boolean' },
    fill: { control: 'boolean' },
  },
  args: {
    label: 'Time range',
    options: OPTIONS,
    value: undefined,
    defaultValue: undefined,
    iconOnly: false,
    size: 'md',
    fill: false,
  },
  render: (args) => html`
    <ds-segmented-control
      label=${args.label}
      .options=${args.options}
      value=${ifDefined(args.value)}
      default-value=${ifDefined(args.defaultValue)}
      ?icon-only=${args.iconOnly}
      size=${args.size}
      ?fill=${args.fill}
    ></ds-segmented-control>
  `,
};

export default meta;
type Story = StoryObj<SegmentedControlArgs>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

export const Fill: Story = { args: { fill: true } };

export const WithDefaultValue: Story = { args: { defaultValue: 'week' } };

export const IconOnly: Story = { args: { options: ICON_OPTIONS, iconOnly: true } };

/**
 * Renders with its trigger-less group open and at least three focusable
 * (enabled) segments so the keyboard gate can verify arrow navigation,
 * wrapping, and Home/End selection.
 */
export const Keyboard: Story = { args: { options: KEYBOARD_OPTIONS } };
