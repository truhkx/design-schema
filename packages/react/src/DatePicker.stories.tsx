import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'DatePicker/React',
  component: DatePicker,
  args: {
    label: 'Due date',
    name: 'due-date',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* notable states */
export const RangeTrue: Story = {
  args: { label: 'Report period', name: 'report-period', range: true },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: '2026-09-10' },
};

export const WithDescription: Story = {
  args: { description: 'The date the order must ship by.' },
};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };

export const WithError: Story = {
  args: { error: 'Due date is required.' },
};

export const WithMinMax: Story = {
  args: { min: '2026-09-01', max: '2026-09-30', description: 'Pick a day in September.' },
};

export const WithDisabledDates: Story = {
  args: {
    description: 'Weekends are unavailable.',
    isDateDisabled: (isoDate: string) => {
      const [year, month, day] = isoDate.split('-').map(Number);
      const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      return weekday === 0 || weekday === 6;
    },
  },
};

export const ShowWeekNumbersTrue: Story = {
  args: { showWeekNumbers: true },
};

export const WithLocale: Story = {
  args: { label: 'Geburtsdatum', name: 'birth-date-de', locale: 'de-DE', defaultValue: '2026-09-10' },
};

export const SizeSm: Story = { args: { size: 'sm' } };

export const SizeMd: Story = { args: { size: 'md' } };

export const HideLabelTrue: Story = { args: { hideLabel: true } };

export const OpenTrue: Story = { args: { open: true } };

/**
 * Open/present with its trigger and the calendar's controls — month/year navigation, the day grid
 * (one roving tab stop), Today and Clear — for the keyboard gate.
 */
export const Keyboard: Story = {
  args: { label: 'Meeting date', name: 'meeting-date-keyboard', defaultValue: '2026-09-10', open: true },
};
