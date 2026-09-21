import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Toolbar.js';
import './Button.js';
import './SegmentedControl.js';
import './Select.js';
import type { ToolbarDensity, ToolbarOrientation, ToolbarOverflow, ToolbarSize } from './Toolbar.js';

interface ToolbarArgs {
  label: string;
  /** Names one of the child sets below; the examples' `children` descriptions are the keys, verbatim. */
  children: string;
  orientation: ToolbarOrientation;
  overflow: ToolbarOverflow;
  size: ToolbarSize;
  density: ToolbarDensity;
}

const button = (label: string): TemplateResult =>
  html`<ds-button variant="ghost" label=${label} overflow-label=${label}></ds-button>`;

/** The Default and Keyboard children: two labelled groups of three ghost Buttons, so a separator is drawn between them. */
const TWO_GROUPS =
  'Two labelled groups of three ghost text Buttons each: Text style (Bold, Italic, Underline) and Insert (Link, Image, Table)';

const CHILDREN: Record<string, () => TemplateResult> = {
  [TWO_GROUPS]: () => html`
    <ds-toolbar-group label="Text style">${button('Bold')}${button('Italic')}${button('Underline')}</ds-toolbar-group>
    <ds-toolbar-group label="Insert">${button('Link')}${button('Image')}${button('Table')}</ds-toolbar-group>
  `,
  'Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)': () =>
    html`${button('Bold')}${button('Italic')}${button('Underline')}`,
  'Three ghost text Buttons labelled Select, Draw and Erase': () =>
    html`${button('Select')}${button('Draw')}${button('Erase')}`,
  'Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with an overflowLabel equal to its own label':
    () => html`${button('Filter')}${button('Sort')}${button('Export')}${button('Delete')}`,
  'A SegmentedControl labelled View (List, Board) and two Selects with hideLabel so the row stays at toolbar height: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)':
    () => html`
      <ds-segmented-control
        label="View"
        .options=${[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
        ]}
      ></ds-segmented-control>
      <ds-select
        label="Owner"
        name="owner"
        hide-label
        .options=${[
          { value: 'anyone', label: 'Anyone' },
          { value: 'me', label: 'Me' },
        ]}
      ></ds-select>
      <ds-select
        label="Sort"
        name="sort"
        hide-label
        .options=${[
          { value: 'newest', label: 'Newest' },
          { value: 'oldest', label: 'Oldest' },
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
    children: TWO_GROUPS,
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
      ${(CHILDREN[args.children] ?? CHILDREN[TWO_GROUPS]!)()}
    </ds-toolbar>
  `,
};

export default meta;
type Story = StoryObj<ToolbarArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

/* overflow */
export const OverflowWrap: Story = { args: { overflow: 'wrap' } };
export const OverflowMenu: Story = { args: { overflow: 'menu' } };
export const OverflowScroll: Story = { args: { overflow: 'scroll' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/** Narrow width so trailing entries collapse into the More menu. */
export const OverflowMenuNarrow: Story = {
  args: { overflow: 'menu' },
  decorators: [(story) => html`<div style="max-inline-size: 16rem;">${story()}</div>`],
};

/** Narrow width so the row scrolls and its edges fade while content is hidden past them. */
export const OverflowScrollNarrow: Story = {
  args: { overflow: 'scroll' },
  decorators: [(story) => html`<div style="max-inline-size: 16rem;">${story()}</div>`],
};

/**
 * Present with six focusable controls and nothing else focusable, for the keyboard gate.
 * `wrap` keeps every control in the DOM at any viewport width, so the roving list never shrinks.
 */
export const Keyboard: Story = { args: { overflow: 'wrap', children: TWO_GROUPS } };

/* examples */

/** The default row of ghost formatting buttons, named by what it controls. */
export const FormattingToolbar: Story = {
  args: {
    label: 'Formatting',
    children: 'Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)',
  },
};

/** A tool palette beside a canvas, where arrows move up and down. */
export const VerticalToolPalette: Story = {
  args: {
    label: 'Drawing tools',
    children: 'Three ghost text Buttons labelled Select, Draw and Erase',
    orientation: 'vertical',
  },
};

/** A dense table-action row at toolbar height that folds trailing buttons into a More menu. */
export const CompactActionsWithOverflow: Story = {
  args: {
    label: 'Table actions',
    children:
      'Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with an overflowLabel equal to its own label',
    overflow: 'menu',
    density: 'compact',
    size: 'sm',
  },
};

/** A filter row that scrolls horizontally with faded edges instead of collapsing. */
export const ScrollingFilterRow: Story = {
  args: {
    label: 'Filters',
    children:
      'A SegmentedControl labelled View (List, Board) and two Selects with hideLabel so the row stays at toolbar height: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)',
    overflow: 'scroll',
  },
};
