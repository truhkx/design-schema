import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Icon.js';
import type { IconName, IconSize } from './Icon.js';

interface IconArgs {
  name: IconName;
  size: IconSize;
  inline: boolean;
  label?: string;
}

const NAMES: IconName[] = [
  'check',
  'dash',
  'chevron-right',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'close',
  'plus',
  'minus',
  'info',
  'success',
  'warning',
  'danger',
  'external',
  'ellipsis',
  'search',
  'arrow-right',
  'arrow-left',
  'calendar',
  'menu',
  'list',
  'grid',
  'play',
  'pause',
  'folder',
  'file',
];

const meta: Meta<IconArgs> = {
  title: 'Icon/Lit',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: NAMES },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    inline: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    name: 'check',
    size: 'md',
    inline: false,
    label: undefined,
  },
  render: (args) => html`
    <ds-icon
      name=${args.name}
      size=${args.size}
      ?inline=${args.inline}
      label=${ifDefined(args.label)}
    ></ds-icon>
  `,
};

export default meta;
type Story = StoryObj<IconArgs>;

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

/* inline: 1em of the surrounding text, on its baseline */
export const Inline: Story = {
  args: { inline: true, name: 'external' },
  render: (args) => html`
    <p style="font-size: var(--font-size-lg); color: var(--color-foreground)">
      Opens in a new tab
      <ds-icon name=${args.name} size=${args.size} ?inline=${args.inline}></ds-icon>
    </p>
  `,
};

/* label: meaningful icon, exposed as an image */
export const Labelled: Story = {
  args: { name: 'warning', label: 'Warning: over quota' },
};

/* color inherits through the shadow root (currentColor) */
export const InheritsColor: Story = {
  args: { name: 'danger' },
  render: (args) => html`
    <span style="color: var(--color-status-danger-icon)">
      <ds-icon name=${args.name} size=${args.size}></ds-icon>
    </span>
  `,
};

/* the whole set at every size */
export const AllGlyphs: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: max-content repeat(5, max-content); gap: var(--space-md); align-items: center; color: var(--color-foreground); font-family: var(--font-family-body); font-size: var(--font-size-sm)">
      ${NAMES.map(
        (name) => html`
          <code>${name}</code>
          <ds-icon name=${name} size="xs"></ds-icon>
          <ds-icon name=${name} size="sm"></ds-icon>
          <ds-icon name=${name} size="md"></ds-icon>
          <ds-icon name=${name} size="lg"></ds-icon>
          <ds-icon name=${name} size="xl"></ds-icon>
        `,
      )}
    </div>
  `,
};
