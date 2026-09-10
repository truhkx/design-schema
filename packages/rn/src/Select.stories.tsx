import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import { withTheme } from './decorators';

const OPTIONS = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'fr', label: 'France' },
];

const meta: Meta<typeof Select> = {
  title: 'Select/React Native',
  component: Select,
  decorators: [withTheme()],
  args: {
    label: 'Country',
    name: 'country',
    options: OPTIONS,
    size: 'md',
    native: 'auto',
    multiple: false,
    hideLabel: false,
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// native
export const NativeAuto: Story = { args: { native: 'auto' } };
export const NativeAlways: Story = { args: { native: 'always' } };
export const NativeNever: Story = { args: { native: 'never' } };

// notable states
export const Multiple: Story = {
  args: {
    label: 'Time zones',
    name: 'timeZones',
    multiple: true,
    defaultValue: ['us', 'ca'],
  },
};

export const Grouped: Story = {
  args: {
    options: [
      { group: 'North America', options: [{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }] },
      { group: 'Europe', options: [{ value: 'fr', label: 'France' }] },
    ],
  },
};

export const HideLabel: Story = { args: { hideLabel: true } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'us' } };

export const Invalid: Story = { args: { invalid: true } };

export const WithError: Story = { args: { error: 'Choose a country.' } };

export const WithDescription: Story = { args: { description: 'Used to set your default currency and tax rate.' } };

/**
 * Rendered open (`open: true`) with its trigger and at least three focusable options,
 * for the axe gate and manual keyboard checks on react-native-web.
 */
export const Keyboard: Story = {
  args: { open: true },
};
