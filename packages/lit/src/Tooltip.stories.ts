import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Tooltip.js';
import './Button.js';
import './Icon.js';
import './Toolbar.js';
import './Stack.js';
import type { TooltipDelay, TooltipPlacement } from './Tooltip.js';

interface TooltipArgs {
  content: string;
  placement: TooltipPlacement;
  describes: boolean;
  delay: TooltipDelay;
  open: boolean | undefined;
}

const meta: Meta<TooltipArgs> = {
  title: 'Tooltip/Lit',
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'start', 'end'] },
    describes: { control: 'boolean' },
    delay: { control: 'select', options: ['default', 'none'] },
    open: { control: 'boolean' },
  },
  args: {
    content: 'Includes archived items',
    placement: 'top',
    describes: true,
    delay: 'default',
    open: undefined,
  },
  render: (args) => html`
    <ds-tooltip
      content=${args.content}
      placement=${args.placement}
      ?no-describes=${!args.describes}
      delay=${args.delay}
      .open=${args.open}
    >
      <ds-button label="Items" variant="secondary"></ds-button>
    </ds-tooltip>
  `,
};

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Default: Story = {};

/* placement */
export const PlacementTop: Story = { args: { placement: 'top', open: true } };
export const PlacementBottom: Story = { args: { placement: 'bottom', open: true } };
export const PlacementStart: Story = { args: { placement: 'start', open: true } };
export const PlacementEnd: Story = { args: { placement: 'end', open: true } };

/* delay */
export const DelayDefault: Story = { args: { delay: 'default' } };
export const DelayNone: Story = { args: { delay: 'none' } };

/* examples */

/** The tooltip is the control's name, not a second announcement, so it is linked as the label. */
export const IconOnlyButtonName: Story = {
  args: { content: 'Add item', describes: false },
  render: (args) => html`
    <ds-tooltip content=${args.content} placement=${args.placement} ?no-describes=${!args.describes} delay=${args.delay} .open=${args.open}>
      <ds-button icon-only label="Add item" variant="ghost">
        <ds-icon slot="leading-icon" name="plus"></ds-icon>
      </ds-button>
    </ds-tooltip>
  `,
};

/** A clarification on a labelled control in dense UI. */
export const ColumnHeaderHint: Story = {
  args: { content: 'Includes archived items' },
  render: (args) => html`
    <ds-tooltip content=${args.content} placement=${args.placement} ?no-describes=${!args.describes} delay=${args.delay} .open=${args.open}>
      <ds-button label="Items" variant="ghost" size="sm"></ds-button>
    </ds-tooltip>
  `,
};

/** A toolbar where a sibling tooltip is already open, so the next one shows instantly. */
export const WarmToolbar: Story = {
  args: { content: 'Grid view', delay: 'none' },
  render: (args) => html`
    <ds-toolbar label="View">
      <ds-tooltip content="List view" no-describes delay=${args.delay}>
        <ds-button icon-only label="List view" variant="ghost"><ds-icon slot="leading-icon" name="list"></ds-icon></ds-button>
      </ds-tooltip>
      <ds-tooltip content=${args.content} placement=${args.placement} ?no-describes=${!args.describes} delay=${args.delay} .open=${args.open}>
        <ds-button icon-only label="Grid view" variant="ghost"><ds-icon slot="leading-icon" name="grid"></ds-icon></ds-button>
      </ds-tooltip>
    </ds-toolbar>
  `,
};

/** A trigger at the top of the page, where the bubble reads better underneath. */
export const BelowTheTrigger: Story = {
  args: { content: 'Open in new tab', placement: 'bottom' },
  render: (args) => html`
    <ds-tooltip content=${args.content} placement=${args.placement} ?no-describes=${!args.describes} delay=${args.delay} .open=${args.open}>
      <ds-button icon-only label="Open in new tab" variant="ghost"><ds-icon slot="leading-icon" name="external"></ds-icon></ds-button>
    </ds-tooltip>
  `,
};

/**
 * Renders `open` so the tooltip is present on mount, among three focusable
 * controls, so the keyboard gate can check Escape hides it without moving focus.
 */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => html`
    <ds-stack direction="horizontal" gap="normal">
      <ds-button label="Before" variant="secondary"></ds-button>
      <ds-tooltip content=${args.content} placement=${args.placement} ?no-describes=${!args.describes} delay=${args.delay} .open=${args.open}>
        <ds-button label="Items" variant="secondary"></ds-button>
      </ds-tooltip>
      <ds-button label="After" variant="secondary"></ds-button>
    </ds-stack>
  `,
};
