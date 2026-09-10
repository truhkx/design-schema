import * as React from 'react';
import { Text as RNText } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { withTheme } from './decorators';

const meta: Meta<typeof Button> = {
  title: 'Button/React Native',
  component: Button,
  decorators: [withTheme({ fit: true })],
  args: {
    label: 'Save changes',
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    iconOnly: false,
    loading: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

// variant
export const VariantPrimary: Story = { args: { variant: 'primary' } };
export const VariantSecondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };
export const VariantGhost: Story = { args: { variant: 'ghost', label: 'Forgot password?' } };
export const VariantDanger: Story = { args: { variant: 'danger', label: 'Delete file' } };

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

// type
export const TypeButton: Story = { args: { type: 'button' } };
export const TypeSubmit: Story = { args: { type: 'submit', label: 'Sign in' } };

/** A decorative glyph standing in for an icon until an Icon component exists. */
const glyph = (char: string): React.JSX.Element => <RNText allowFontScaling={false}>{char}</RNText>;

// leadingIcon / trailingIcon
export const LeadingIcon: Story = { args: { leadingIcon: glyph('+'), label: 'Add item' } };
export const TrailingIcon: Story = { args: { trailingIcon: glyph('→'), label: 'Next' } };
export const IconOnly: Story = { args: { iconOnly: true, leadingIcon: glyph('×'), label: 'Close', variant: 'ghost' } };
