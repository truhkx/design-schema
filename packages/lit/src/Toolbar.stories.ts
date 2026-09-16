import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Toolbar.js';
import './Button.js';
import './SegmentedControl.js';
import './Select.js';
import type { ToolbarDensity, ToolbarOrientation, ToolbarOverflow, ToolbarSize } from './Toolbar.js';

interface ToolbarArgs {
  label: string;
  /** Names one of the child sets below; the examples' `children` descriptions are the keys. */
  children: string;
  orientation: ToolbarOrientation;
  overflow: ToolbarOverflow;
  size: ToolbarSize;
  density: ToolbarDensity;
}

const button = (label: string): TemplateResult =>
  html`<ds-button variant="ghost" label=${label} overflow-label=${label}></ds-button>`;

const CHILDREN: Record<string, () => TemplateResult> = {
  'Formatting groups': () => html`
    <ds-toolbar-group label="Text style">${button('Bold')}${button('Italic')}${button('Underline')}</ds-toolbar-group>
    <ds-toolbar-group label="Alignment">${button('Align left')}${button('Align center')}${button('Align right')}</ds-toolbar-group>
  `,
  'Bold, Italic and Underline buttons': () => html`${button('Bold')}${button('Italic')}${button('Underline')}`,
  'Select, Draw and Erase buttons': () => html`${button('Select')}${button('Draw')}${button('Erase')}`,
  'Filter, Sort, Export and Delete buttons': () => html`
    <ds-toolbar-group label="View">${button('Filter')}${button('Sort')}</ds-toolbar-group>
    <ds-toolbar-group label="Data">${button('Export')}</ds-toolbar-group>
    <ds-toolbar-group label="Danger">${button('Delete')}</ds-toolbar-group>
  `,
  'A SegmentedControl and two Selects': () => html`
    <ds-segmented-control
      label="Period"
      .options=${[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
    ></ds-segmented-control>
    <ds-select
      label="Status"
      hide-label
      .options=${[
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
      ]}
    ></ds-select>
    <ds-select
      label="Owner"
      hide-label
      .options=${[
        { value: 'me', label: 'Me' },
        { value: 'anyone', label: 'Anyone' },
      ]}
    ></ds-select>
  `,
};

const meta: Meta<ToolbarArgs> = {
  title: 'Toolbar/Lit',
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'select', options: Object.keys(CHILDREN) },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    overflow: { control: 'select', options: ['wrap', 'menu', 'scroll'] },
    size: { control: 'select', options: ['sm', 'md'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
  },
  args: {
    label: 'Formatting',
    children: 'Formatting groups',
    orientation: 'horizontal',
    overflow: 'menu',
    size: 'md',
    density: 'comfortable',
  },
  render: (args) => html`
    <ds-toolbar
      label=${args.label}
      orientation=${args.orientation}
      overflow=${args.overflow}
      size=${args.size}
      density=${args.density}
    >
      ${(CHILDREN[args.children] ?? CHILDREN['Formatting groups']!)()}
    </ds-toolbar>
  `,
};

export default meta;
type Story = StoryObj<ToolbarArgs>;

export const Default: Story = {};

export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

export const OverflowWrap: Story = { args: { overflow: 'wrap' } };
export const OverflowMenu: Story = { args: { overflow: 'menu' } };
export const OverflowScroll: Story = { args: { overflow: 'scroll' } };

export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/** Narrow width so trailing entries collapse into the More menu. */
export const OverflowMenuNarrow: Story = {
  args: { overflow: 'menu' },
  decorators: [(story) => html`<div style="max-inline-size: 16rem;">${story()}</div>`],
};

/** Six focusable controls in two groups: Tab enters once, arrows move, Home/End jump. */
export const Keyboard: Story = {};

export const FormattingToolbar: Story = {
  args: { label: 'Formatting', children: 'Bold, Italic and Underline buttons' },
};

export const VerticalToolPalette: Story = {
  args: { label: 'Drawing tools', children: 'Select, Draw and Erase buttons', orientation: 'vertical' },
};

export const CompactActionsWithOverflow: Story = {
  args: {
    label: 'Table actions',
    children: 'Filter, Sort, Export and Delete buttons',
    overflow: 'menu',
    density: 'compact',
    size: 'sm',
  },
};

export const ScrollingFilterRow: Story = {
  args: { label: 'Filters', children: 'A SegmentedControl and two Selects', overflow: 'scroll' },
};
