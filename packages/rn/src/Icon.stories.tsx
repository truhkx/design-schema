import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Icon> = {
  title: 'Icon/React Native',
  component: Icon,
  decorators: [withTheme({ fit: true })],
  args: {
    name: 'check',
    size: 'md',
    inline: false,
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

// name
export const NameCheck: Story = { args: { name: 'check' } };
export const NameDash: Story = { args: { name: 'dash' } };
export const NameChevronRight: Story = { args: { name: 'chevron-right' } };
export const NameChevronDown: Story = { args: { name: 'chevron-down' } };
export const NameChevronUp: Story = { args: { name: 'chevron-up' } };
export const NameChevronLeft: Story = { args: { name: 'chevron-left' } };
export const NameClose: Story = { args: { name: 'close' } };
export const NamePlus: Story = { args: { name: 'plus' } };
export const NameMinus: Story = { args: { name: 'minus' } };
export const NameInfo: Story = { args: { name: 'info' } };
export const NameSuccess: Story = { args: { name: 'success' } };
export const NameWarning: Story = { args: { name: 'warning' } };
export const NameDanger: Story = { args: { name: 'danger' } };
export const NameExternal: Story = { args: { name: 'external' } };
export const NameEllipsis: Story = { args: { name: 'ellipsis' } };
export const NameSearch: Story = { args: { name: 'search' } };
export const NameArrowRight: Story = { args: { name: 'arrow-right' } };
export const NameArrowLeft: Story = { args: { name: 'arrow-left' } };

// size
export const SizeXs: Story = { args: { size: 'xs' } };
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeXl: Story = { args: { size: 'xl' } };

// inline — nested in a system Text so the glyph inherits its size and color
export const Inline: Story = {
  args: { name: 'external', inline: true },
  render: (args) => (
    <Text size="lg">
      Read the release notes <Icon {...args} />
    </Text>
  ),
};

// label — meaningful icon, exposed as an image with this name
export const Label: Story = { args: { name: 'warning', label: 'Warning: over quota' } };
