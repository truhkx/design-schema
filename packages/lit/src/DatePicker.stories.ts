import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './DatePicker.js';
import type { DatePickerOpenChangeDetail, DatePickerSize, DatePickerValue, DsDatePicker } from './DatePicker.js';

interface DatePickerArgs {
  label: string;
  name: string;
  value?: DatePickerValue | undefined;
  defaultValue?: DatePickerValue | undefined;
  open?: boolean | undefined;
  range: boolean;
  min?: string | undefined;
  max?: string | undefined;
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  locale?: string | undefined;
  showWeekNumbers: boolean;
  placeholder?: string | undefined;
  description?: string | undefined;
  required: boolean;
  hideLabel: boolean;
  size: DatePickerSize;
  disabled: boolean;
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
    open: { control: 'boolean' },
    showWeekNumbers: { control: 'boolean' },
    required: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Due date',
    name: 'due',
    range: false,
    showWeekNumbers: false,
    required: false,
    hideLabel: false,
    size: 'md',
    disabled: false,
  },
  render: (args) => html`
    <ds-date-picker
      label=${args.label}
      name=${args.name}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      .open=${args.open}
      ?range=${args.range}
      min=${ifDefined(args.min)}
      max=${ifDefined(args.max)}
      .isDateDisabled=${args.isDateDisabled}
      locale=${ifDefined(args.locale)}
      ?show-week-numbers=${args.showWeekNumbers}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?hide-label=${args.hideLabel}
      size=${args.size}
      ?disabled=${args.disabled}
      error=${ifDefined(args.error)}
    ></ds-date-picker>
  `,
};

export default meta;
type Story = StoryObj<DatePickerArgs>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* Examples from the component doc, with exactly their `given`. */

export const DateOfBirth: Story = { args: { label: 'Date of birth', name: 'dob', max: '2026-09-16' } };

export const StayDates: Story = { args: { label: 'Stay', name: 'stay', range: true } };

export const AppointmentWithWeekNumbers: Story = {
  args: { label: 'Appointment', name: 'appointment', min: '2026-09-16', showWeekNumbers: true },
};

export const CompactCellEditor: Story = { args: { label: 'Due date', name: 'due', size: 'sm', hideLabel: true } };

/* Notable states. */

export const WithValue: Story = { args: { defaultValue: '2026-09-10' } };

export const RangeWithValue: Story = {
  args: { label: 'Report period', name: 'period', range: true, defaultValue: { start: '2026-09-07', end: '2026-09-11' } },
};

export const ShowWeekNumbers: Story = { args: { showWeekNumbers: true } };

export const Open: Story = { args: { open: true, defaultValue: '2026-09-10' } };

export const WithDescription: Story = { args: { description: 'The day the order must ship by.' } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };

export const WithError: Story = { args: { error: 'Due date is required.' } };

export const WeekendsDisabled: Story = {
  args: {
    description: 'Weekdays only.',
    isDateDisabled: (isoDate: string) => {
      const [year, month, day] = isoDate.split('-').map(Number);
      const weekday = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay();
      return weekday === 0 || weekday === 6;
    },
  },
};

export const LocaleDe: Story = { args: { label: 'Fälligkeitsdatum', locale: 'de-DE', defaultValue: '2026-09-10' } };

/**
 * The calendar open with its trigger: month/year Selects and prev/next Buttons, the grid (one
 * roving tab stop), Today and Clear. `open` follows `open-change`, so Escape closes it and
 * returns focus to the calendar button.
 */
export const Keyboard: Story = {
  args: { open: true, defaultValue: '2026-09-10' },
  render: (args) => html`
    <ds-date-picker
      label=${args.label}
      name=${args.name}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      .open=${args.open}
      ?range=${args.range}
      min=${ifDefined(args.min)}
      max=${ifDefined(args.max)}
      .isDateDisabled=${args.isDateDisabled}
      locale=${ifDefined(args.locale)}
      ?show-week-numbers=${args.showWeekNumbers}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?hide-label=${args.hideLabel}
      size=${args.size}
      ?disabled=${args.disabled}
      error=${ifDefined(args.error)}
      @open-change=${(event: CustomEvent<DatePickerOpenChangeDetail>) => {
        (event.currentTarget as DsDatePicker).open = event.detail.open;
      }}
    ></ds-date-picker>
  `,
};
