import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './BottomSheet.js';
import './Button.js';
import './Text.js';
import './Input.js';
import './Link.js';
import type { BottomSheetHeight } from './BottomSheet.js';

interface BottomSheetArgs {
  open: boolean;
  heading: string;
  hideHeading: boolean;
  height: BottomSheetHeight;
  dismissible: boolean;
  dragToDismiss: boolean;
}

const meta: Meta<BottomSheetArgs> = {
  title: 'BottomSheet/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['close', 'drag-dismiss'] },
  },
  argTypes: {
    height: { control: 'select', options: ['content', 'half', 'full'] },
  },
  args: {
    open: true,
    heading: 'Filters',
    hideHeading: false,
    height: 'content',
    dismissible: true,
    dragToDismiss: true,
  },
  render: (args) => html`
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading}
      height=${args.height}
      ?no-dismiss=${!args.dismissible}
      ?drag-to-dismiss=${args.dragToDismiss}
    >
      <ds-text>Narrow results by price, distance and rating.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply filters"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Reset"></ds-button>
    </ds-bottom-sheet>
  `,
};

export default meta;
type Story = StoryObj<BottomSheetArgs>;

export const Default: Story = {};

/* height */
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightHalf: Story = { args: { height: 'half' } };
export const HeightFull: Story = { args: { height: 'full' } };

export const HideHeading: Story = {
  args: { hideHeading: true, heading: 'Share' },
  render: (args) => html`
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading}
      height=${args.height}
      ?no-dismiss=${!args.dismissible}
      ?drag-to-dismiss=${args.dragToDismiss}
    >
      <ds-text>Share this listing with a link.</ds-text>
    </ds-bottom-sheet>
  `,
};

export const DismissibleFalse: Story = {
  args: { dismissible: false },
  render: (args) => html`
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      height=${args.height}
      ?no-dismiss=${!args.dismissible}
      ?drag-to-dismiss=${args.dragToDismiss}
    >
      <ds-text>You must choose an option below to continue.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Continue"></ds-button>
    </ds-bottom-sheet>
  `,
};

export const DragToDismissFalse: Story = { args: { dragToDismiss: false } };

export const NoFooter: Story = {
  render: (args) => html`
    <ds-bottom-sheet ?open=${args.open} heading="Details" height=${args.height}>
      <ds-text>Additional information about this item.</ds-text>
    </ds-bottom-sheet>
  `,
};

/**
 * Renders open with its trigger and at least three focusable children so the
 * keyboard gate can verify Tab/Shift+Tab wrapping and Escape.
 */
export const Keyboard: Story = {
  render: () => html`
    <button type="button" id="bottom-sheet-trigger">Filters</button>
    <ds-bottom-sheet open heading="Filters" height="content">
      <ds-input label="Keyword" name="keyword" value=""></ds-input>
      <ds-link href="#reset">Reset all</ds-link>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply filters"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-bottom-sheet>
  `,
};
