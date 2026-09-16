import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './DatePicker.js';
import type { DatePickerSize, DatePickerValue } from './DatePicker.js';

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

/* states */
export const Range: Story = { args: { range: true, label: 'Report period', name: 'period', defaultValue: { start: '2026-09-01', end: '2026-09-10' } } };
export const ShowWeekNumbers: Story = { args: { showWeekNumbers: true } };
export const Required: Story = { args: { required: true } };
export const WithDescription: Story = { args: { label: 'Date of birth', name: 'dob', description: 'Must be at least 18 years ago.' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };
export const Open: Story = { args: { open: true, defaultValue: '2026-09-10' } };
export const ErrorIdentified: Story = { args: { required: true, error: 'Fix this before continuing.' } };

/* examples */
export const DateOfBirth: Story = { args: { label: 'Date of birth', name: 'dob', max: '2026-09-16' } };
export const StayDates: Story = { args: { label: 'Stay', name: 'stay', range: true } };
export const AppointmentWithWeekNumbers: Story = {
  args: { label: 'Appointment', name: 'appointment', min: '2026-09-16', showWeekNumbers: true },
};
export const CompactCellEditor: Story = { args: { label: 'Due date', name: 'due', size: 'sm', hideLabel: true } };

/**
 * Open (uncontrolled, so Escape closes it) with its trigger and the calendar's
 * focusable controls: prev/next, month/year Selects, the grid's roving day,
 * Today and Clear.
 */
export const Keyboard: Story = {
  args: { defaultValue: '2026-09-10' },
  play: async ({ canvasElement }) => {
    const picker = canvasElement.querySelector('ds-date-picker');
    await picker?.updateComplete;
    picker?.shadowRoot?.querySelector<HTMLElement>('#calendar-button')?.click();
  },
};
