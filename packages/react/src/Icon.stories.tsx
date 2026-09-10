import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { Text } from './Text';

const meta = {
  title: 'Icon/React',
  component: Icon,
  args: {
    name: 'check',
    size: 'md',
    inline: false,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* name */
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
export const NameCalendar: Story = { args: { name: 'calendar' } };
export const NameMenu: Story = { args: { name: 'menu' } };
export const NameList: Story = { args: { name: 'list' } };
export const NameGrid: Story = { args: { name: 'grid' } };
export const NamePlay: Story = { args: { name: 'play' } };
export const NamePause: Story = { args: { name: 'pause' } };
export const NameFolder: Story = { args: { name: 'folder' } };
export const NameFile: Story = { args: { name: 'file' } };

/* size */
export const SizeXs: Story = { args: { size: 'xs' } };
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeXl: Story = { args: { size: 'xl' } };

/* booleans */
export const Inline: Story = {
  args: { inline: true, name: 'external' },
  render: (args) => (
    <Text element="p">
      Opens in a new tab <Icon {...args} />
    </Text>
  ),
};

/* label: a meaningful icon, announced as an image. */
export const Labelled: Story = { args: { name: 'warning', label: 'Warning: over quota' } };
