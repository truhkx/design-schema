import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Toolbar.js';
import './Button.js';
import type { ToolbarDensity, ToolbarOrientation, ToolbarOverflow, ToolbarSize } from './Toolbar.js';

interface ToolbarArgs {
  label: string;
  orientation: ToolbarOrientation;
  overflow: ToolbarOverflow;
  size: ToolbarSize;
  density: ToolbarDensity;
}

const meta: Meta<ToolbarArgs> = {
  title: 'Toolbar/Lit',
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    overflow: { control: 'select', options: ['wrap', 'menu', 'scroll'] },
    size: { control: 'select', options: ['sm', 'md'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
  },
  args: {
    label: 'Formatting',
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
      style="max-inline-size: 22rem;"
    >
      <ds-toolbar-group>
        <ds-button variant="ghost" size="sm" label="Bold" overflow-label="Bold"></ds-button>
        <ds-button variant="ghost" size="sm" label="Italic" overflow-label="Italic"></ds-button>
        <ds-button variant="ghost" size="sm" label="Underline" overflow-label="Underline"></ds-button>
      </ds-toolbar-group>
      <ds-toolbar-group>
        <ds-button variant="ghost" size="sm" label="Align left" overflow-label="Align left"></ds-button>
        <ds-button variant="ghost" size="sm" label="Align center" overflow-label="Align center"></ds-button>
        <ds-button variant="ghost" size="sm" label="Align right" overflow-label="Align right"></ds-button>
      </ds-toolbar-group>
      <ds-button variant="ghost" size="sm" label="Share" overflow-label="Share"></ds-button>
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

/**
 * Renders with at least three enabled, focusable controls so the keyboard
 * gate can verify roving-tabindex arrow navigation, Home/End, and Tab in/out.
 */
export const Keyboard: Story = { args: {} };
