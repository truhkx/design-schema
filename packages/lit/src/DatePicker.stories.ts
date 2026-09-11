import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './DatePicker.js';
import type { DatePickerValue } from './DatePicker.js';

interface DatePickerArgs {
  label: string;
  name: string;
  value?: DatePickerValue | undefined;
  defaultValue?: DatePickerValue | undefined;
  open?: boolean | undefined;
  range: boolean;
  min?: string | undefined;
  max?: string | undefined;
  locale?: string | undefined;
  showWeekNumbers: boolean;
  placeholder?: string | undefined;
  description?: string | undefined;
  required: boolean;
  hideLabel: boolean;
  size: 'sm' | 'md';
  disabled: boolean;
  invalid: boolean;
  error?: string | undefined;
}

const meta: Meta<DatePickerArgs> = {
  title: 'DatePicker/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'open-change'] },
  },
  argTypes: {
    range: { control: 'boolean' },
    showWeekNumbers: { control: 'boolean' },
    required: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    label: 'Due date',
    name: 'due',
    value: undefined,
    defaultValue: undefined,
    open: undefined,
    range: false,
    min: undefined,
    max: undefined,
    locale: undefined,
    showWeekNumbers: false,
    placeholder: undefined,
    description: undefined,
    required: false,
    hideLabel: false,
    size: 'md',
    disabled: false,
    invalid: false,
    error: undefined,
  },
  render: (args) => html`
    <ds-date-picker
      label=${args.label}
      name=${args.name}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      ?open=${args.open}
      ?range=${args.range}
      min=${ifDefined(args.min)}
      max=${ifDefined(args.max)}
      locale=${ifDefined(args.locale)}
      ?show-week-numbers=${args.showWeekNumbers}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?hide-label=${args.hideLabel}
      size=${args.size}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      error=${ifDefined(args.error)}
    ></ds-date-picker>
  `,
};

export default meta;
type Story = StoryObj<DatePickerArgs>;

export const Default: Story = {};

/* range */
export const RangeFalse: Story = { args: { range: false } };
export const RangeTrue: Story = {
  args: { range: true, label: 'Report period', name: 'period', defaultValue: { start: '2026-09-01', end: '2026-09-10' } },
};

/* showWeekNumbers */
export const ShowWeekNumbersFalse: Story = { args: { showWeekNumbers: false } };
export const ShowWeekNumbersTrue: Story = { args: { showWeekNumbers: true } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* boolean states */
export const RequiredTrue: Story = { args: { required: true } };
export const HideLabelTrue: Story = { args: { hideLabel: true, defaultValue: '2026-09-10' } };
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };
export const OpenTrue: Story = { args: { open: true, defaultValue: '2026-09-10' } };

export const WithMinMax: Story = {
  args: {
    label: 'Appointment',
    name: 'appointment',
    min: '2026-09-01',
    max: '2026-09-30',
    description: 'Weekday slots this month only.',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Date of birth',
    name: 'dob',
    description: 'Must be at least 18 years ago.',
  },
};

export const ErrorIdentified: Story = {
  args: { required: true, error: 'Fix this before continuing.' },
};

/**
 * Renders open with its trigger and the header/grid/footer controls so the
 * keyboard gate can verify ArrowDown-to-open, arrow/Home/End/PageUp/PageDown
 * navigation, Enter/Space to select, Escape, and Tab cycling through the
 * month/year selects, the grid's single roving tab stop, and Today/Clear.
 */
export const Keyboard: Story = {
  args: { defaultValue: '2026-09-10' },
  play: async ({ canvasElement }) => {
    const picker = canvasElement.querySelector('ds-date-picker');
    const trigger = picker?.shadowRoot?.querySelector<HTMLElement>('#calendar-button');
    trigger?.click();
  },
};
