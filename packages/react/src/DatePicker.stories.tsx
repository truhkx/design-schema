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

/** A single date in the past, typed or picked. */
export const DateOfBirth: Story = { args: { label: 'Date of birth', name: 'dob', max: '2026-09-16' } };

/** A start and an end date picked in one calendar, with two inputs in the field. */
export const StayDates: Story = { args: { label: 'Stay', name: 'stay', range: true } };

/** A bookable date no earlier than today, with the ISO week-number column shown. */
export const AppointmentWithWeekNumbers: Story = {
  args: { label: 'Appointment', name: 'appointment', min: '2026-09-16', showWeekNumbers: true },
};

/** A small field inside a grid cell, named by its column. */
export const CompactCellEditor: Story = { args: { label: 'Due date', name: 'due', size: 'sm', hideLabel: true } };

/** A field that already holds a date, shown in the locale's pattern. */
export const WithAValue: Story = { args: { label: 'Due date', name: 'due', defaultValue: '2026-09-10' } };

/** A range that already holds both ends, so the calendar shows the bar between them. */
export const RangeWithDates: Story = {
  args: { label: 'Stay', name: 'stay', range: true, defaultValue: { start: '2026-09-10', end: '2026-09-14' } },
};

/** A field whose value was rejected, with the message under it. */
export const WithAnError: Story = {
  args: { label: 'Due date', name: 'due', defaultValue: '2026-09-10', error: 'Choose a date at least two days from now.' },
};

/** The same field in a locale whose pattern, month names and first day of the week all differ. */
export const GermanLocale: Story = {
  args: { label: 'Fälligkeitsdatum', name: 'due', locale: 'de-DE', defaultValue: '2026-09-10' },
};

/* Notable states. */

export const Open: Story = { args: { open: true, defaultValue: '2026-09-10' } };

export const WithDescription: Story = { args: { description: 'The day the order must ship by.' } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };

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

/**
 * The calendar open with its trigger: month/year Selects and prev/next Buttons, the grid (one
 * roving tab stop), Today and Clear. `open` follows onOpenChange in story state, so Escape closes
 * it and focus returns to the calendar button.
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
