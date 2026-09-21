import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';
import { withTheme } from './decorators';

const meta: Meta<typeof DatePicker> = {
  title: 'DatePicker/React Native',
  component: DatePicker,
  decorators: [withTheme()],
  args: {
    label: 'Start date',
    name: 'start-date',
    required: false,
    hideLabel: false,
    size: 'md',
    disabled: false,
    range: false,
    showWeekNumbers: false,
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// notable states
export const WithValue: Story = { args: { defaultValue: '2026-09-10' } };

export const Range: Story = {
  args: { label: 'Report period', name: 'report-period', range: true, defaultValue: { start: '2026-09-01', end: '2026-09-10' } },
};

export const ShowWeekNumbers: Story = { args: { defaultValue: '2026-09-10', showWeekNumbers: true } };

export const WithMinMax: Story = { args: { defaultValue: '2026-09-10', min: '2026-09-01', max: '2026-09-30' } };

/** Weekends are shown but cannot be picked. */
export const WithDisabledDays: Story = {
  args: {
    defaultValue: '2026-09-10',
    isDateDisabled: (isoDate: string) => {
      const weekday = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
      return weekday === 0 || weekday === 6;
    },
  },
};

export const WithDescription: Story = { args: { description: 'Must be at least 18 years ago.' } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };

export const WithError: Story = { args: { error: 'Start date is required.' } };

export const HideLabel: Story = { args: { hideLabel: true } };

// examples
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

/**
 * Starts open with at least three focusable children in the sheet — the previous/next
 * month Buttons, the month and year Selects, the day grid and Today/Clear — for the axe
 * gate and manual keyboard checks on react-native-web. `open` is kept in story state
 * following `onOpenChange`, as Select and Combobox, so Escape can close it.
 */
export const Keyboard: Story = {
  args: { defaultValue: '2026-09-10', open: true },
  render: function KeyboardStory(args) {
    const [open, setOpen] = React.useState(args.open ?? true);
    return <DatePicker {...args} open={open} onOpenChange={setOpen} />;
  },
};
