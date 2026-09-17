import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'DatePicker/React',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    label: 'Due date',
    name: 'due',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
 * roving tab stop), Today and Clear. `open` follows onOpenChange, so Escape closes it.
 */
export const Keyboard: Story = {
  args: { open: true, defaultValue: '2026-09-10' },
  render: function KeyboardStory(args) {
    const [open, setOpen] = useState(args.open ?? true);
    return (
      <DatePicker
        {...args}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          args.onOpenChange?.(next);
        }}
      />
    );
  },
};
