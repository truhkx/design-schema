import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { Text } from './Text';

const meta: Meta<typeof Icon> = {
  title: 'Icon/React',
  component: Icon,
  tags: ['autodocs'],
  args: {
    name: 'check',
    size: 'md',
    inline: false,
  },
};

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

/* A lone status glyph that is the whole message, so it says what it means instead of what it depicts. */
export const StatusInACell: Story = {
  args: { name: 'warning', label: 'Warning: over quota' },
};

/* The usual case - a glyph next to text, with no label, so the label carries the meaning alone. */
export const DecorativeBesideALabel: Story = {
  args: { name: 'check', size: 'sm' },
  render: (args) => (
    <Text element="span" size="sm">
      <Icon {...args} /> Saved
    </Text>
  ),
};

/*
 * An icon sized at 1em of the surrounding text and sitting on its baseline, for use inside a Text or
 * Link. "Read the release notes" is story scaffolding, not copy.
 */
export const InlineInRunningText: Story = {
  args: { name: 'external', inline: true },
  render: (args) => (
    <Text>
      Read the release notes <Icon {...args} />
    </Text>
  ),
};
