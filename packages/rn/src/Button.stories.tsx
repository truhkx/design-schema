import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { useTheme } from './theme';
import type { Tokens } from './theme';
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
    inverse: false,
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

const FOREGROUND_TOKEN: Record<ButtonVariant, keyof Tokens> = {
  primary: 'colorActionPrimaryForeground',
  secondary: 'colorActionSecondaryForeground',
  ghost: 'colorActionGhostForeground',
  danger: 'colorActionDangerForeground',
};

/** A decorative glyph colored to match the button's own foreground, since Icon takes no cascade on this platform. */
function GlyphIcon({
  name,
  variant = 'primary',
  inverse = false,
}: {
  name: IconName;
  variant?: ButtonVariant | undefined;
  inverse?: boolean | undefined;
}): React.JSX.Element {
  const { tokens } = useTheme();
  const color = variant === 'ghost' && inverse ? tokens.colorInverseLink : (tokens[FOREGROUND_TOKEN[variant]] as string);
  return <Icon name={name} color={color} />;
}

// leadingIcon / trailingIcon
export const LeadingIcon: Story = { args: { leadingIcon: <GlyphIcon name="plus" />, label: 'Add item' } };
export const TrailingIcon: Story = { args: { trailingIcon: <GlyphIcon name="arrow-right" />, label: 'Next' } };
export const IconOnly: Story = {
  args: { iconOnly: true, leadingIcon: <GlyphIcon name="close" variant="ghost" />, label: 'Close', variant: 'ghost' },
};

// notable states
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const Expanded: Story = { args: { expanded: true, label: 'Options', trailingIcon: <GlyphIcon name="chevron-down" /> } };
export const AccessibleName: Story = {
  args: { label: 'Amount', accessibleName: 'Sort by Amount, ascending', trailingIcon: <GlyphIcon name="chevron-up" /> },
};

/** Stands in for a Toast or tooltip-like panel: the surface `inverse` buttons sit on. */
function InverseSurface({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { tokens } = useTheme();
  return (
    <View style={{ backgroundColor: tokens.colorInverseSurface, padding: tokens.spaceMd, borderRadius: tokens.radiusMd }}>
      {children}
    </View>
  );
}

export const Inverse: Story = {
  args: { variant: 'ghost', inverse: true, label: 'Learn more' },
  render: (args) => (
    <InverseSurface>
      <Button {...args} />
    </InverseSurface>
  ),
};

// track — trackPress logs to the console in development; no onTrack handler needed to see it fire.
export const Tracked: Story = { args: { track: 'signup', label: 'Sign up' } };
