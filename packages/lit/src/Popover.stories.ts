import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Popover.js';
import './Button.js';
import './Input.js';
import './Text.js';
import './Link.js';
import type { PopoverPlacement } from './Popover.js';

interface PopoverArgs {
  heading?: string;
  placement: PopoverPlacement;
  modal: boolean;
  showArrow: boolean;
  dismissible: boolean;
  open?: boolean;
}

const meta: Meta<PopoverArgs> = {
  title: 'Popover/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['open-change'] },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'start', 'end'],
    },
  },
  args: {
    heading: 'Filters',
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      placement=${args.placement}
      ?modal=${args.modal}
      ?show-arrow=${args.showArrow}
      .dismissible=${args.dismissible}
      ?open=${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>
      <ds-text size="sm" tone="muted">Show items matching every condition below.</ds-text>
      <ds-input label="Status" name="status" value="Active"></ds-input>
      <ds-button variant="primary" size="sm" label="Apply"></ds-button>
    </ds-popover>
  `,
};

export default meta;
type Story = StoryObj<PopoverArgs>;

export const Default: Story = {};

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start', open: true } };
export const PlacementBottom: Story = { args: { placement: 'bottom', open: true } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end', open: true } };
export const PlacementTopStart: Story = { args: { placement: 'top-start', open: true } };
export const PlacementTop: Story = { args: { placement: 'top', open: true } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end', open: true } };
export const PlacementStart: Story = { args: { placement: 'start', open: true } };
export const PlacementEnd: Story = { args: { placement: 'end', open: true } };

export const ModalTrue: Story = {
  args: { open: true, modal: true, heading: 'Confirm export' },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      placement=${args.placement}
      ?modal=${args.modal}
      ?show-arrow=${args.showArrow}
      .dismissible=${args.dismissible}
      ?open=${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Export"></ds-button>
      <ds-text size="sm">This can't be undone once started.</ds-text>
      <ds-button variant="primary" size="sm" label="Start export"></ds-button>
    </ds-popover>
  `,
};

export const ShowArrowTrue: Story = { args: { open: true, showArrow: true } };

export const DismissibleFalse: Story = { args: { open: true, dismissible: false } };

export const NoHeading: Story = {
  args: { heading: undefined, open: true },
  render: (args) => html`
    <ds-popover
      placement=${args.placement}
      ?modal=${args.modal}
      ?show-arrow=${args.showArrow}
      .dismissible=${args.dismissible}
      ?open=${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Share this page"></ds-button>
      <ds-link href="#">Copy link</ds-link>
    </ds-popover>
  `,
};

/**
 * Renders open with its trigger and at least three focusable children so the
 * keyboard gate can verify Tab/Shift+Tab out and Escape.
 */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      placement=${args.placement}
      ?modal=${args.modal}
      ?show-arrow=${args.showArrow}
      .dismissible=${args.dismissible}
      ?open=${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>
      <ds-input label="Status" name="status" value="Active"></ds-input>
      <ds-input label="Owner" name="owner" value="Me"></ds-input>
      <ds-button variant="primary" size="sm" label="Apply"></ds-button>
    </ds-popover>
  `,
};
