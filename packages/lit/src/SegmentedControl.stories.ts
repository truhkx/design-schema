import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './SegmentedControl.js';
import type { SegmentedControlOption, SegmentedControlSize } from './SegmentedControl.js';

interface SegmentedControlArgs {
  label: string;
  options: SegmentedControlOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  iconOnly: boolean;
  size: SegmentedControlSize;
  fill: boolean;
}

const OPTIONS: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
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
    label: 'Range',
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

/* notable states */
export const Fill: Story = { args: { fill: true } };
export const Controlled: Story = { args: { value: 'week' } };
export const DisabledSegment: Story = {
  args: {
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week', disabled: true },
      { value: 'month', label: 'Month' },
    ],
  },
};

/* examples */
export const ViewMode: Story = {
  args: {
    label: 'View mode',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
    ],
    defaultValue: 'list',
  },
};

export const IconOnlyToolbar: Story = {
  args: {
    label: 'View mode',
    options: [
      { value: 'list', label: 'List view', icon: 'list' },
      { value: 'grid', label: 'Grid view', icon: 'grid' },
    ],
    iconOnly: true,
    size: 'sm',
  },
};

export const FilledRangeSwitch: Story = {
  args: {
    label: 'Range',
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ],
    defaultValue: 'week',
    fill: true,
  },
};

/** Present with three enabled segments and no decorators, for the keyboard gate. */
export const Keyboard: Story = {};
