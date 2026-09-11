import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './SidePanel.js';
import './Button.js';
import './Link.js';
import './Input.js';
import './Text.js';
import type { SidePanelSide, SidePanelWidth, SidePanelPersistent, SidePanelLandmark } from './SidePanel.js';

interface SidePanelArgs {
  open: boolean;
  heading: string;
  hideHeading: boolean;
  side: SidePanelSide;
  width: SidePanelWidth;
  persistent: SidePanelPersistent;
  landmark: SidePanelLandmark;
  modal: boolean;
  scrim: boolean;
  dismissible: boolean;
  swipeable: boolean;
}

const meta: Meta<SidePanelArgs> = {
  title: 'SidePanel/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['open-change'] },
  },
  argTypes: {
    side: { control: 'select', options: ['start', 'end'] },
    width: { control: 'select', options: ['narrow', 'default', 'wide'] },
    persistent: { control: 'select', options: ['never', 'content', 'page'] },
    landmark: { control: 'select', options: ['complementary', 'navigation'] },
  },
  args: {
    open: true,
    heading: 'Menu',
    hideHeading: false,
    side: 'start',
    width: 'default',
    persistent: 'never',
    landmark: 'complementary',
    modal: false,
    scrim: true,
    dismissible: true,
    swipeable: true,
  },
  render: (args) => html`
    <ds-side-panel
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading}
      side=${args.side}
      width=${args.width}
      persistent=${args.persistent}
      landmark=${args.landmark}
      ?modal=${args.modal}
      .scrim=${args.scrim}
      .dismissible=${args.dismissible}
      .swipeable=${args.swipeable}
    >
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
      <ds-link href="#settings">Settings</ds-link>
    </ds-side-panel>
  `,
};

export default meta;
type Story = StoryObj<SidePanelArgs>;

export const Default: Story = {};

/* side */
export const SideStart: Story = { args: { side: 'start' } };
export const SideEnd: Story = { args: { side: 'end' } };

/* width */
export const WidthNarrow: Story = { args: { width: 'narrow' } };
export const WidthDefault: Story = { args: { width: 'default' } };
export const WidthWide: Story = { args: { width: 'wide' } };

/* persistent */
export const PersistentNever: Story = { args: { persistent: 'never' } };
export const PersistentContent: Story = { args: { persistent: 'content' } };
export const PersistentPage: Story = { args: { persistent: 'page' } };

export const HideHeading: Story = { args: { hideHeading: true } };

/* role (landmark) */
export const RoleComplementary: Story = { args: { landmark: 'complementary' } };
export const RoleNavigation: Story = { args: { landmark: 'navigation' } };

export const Modal: Story = {
  args: { modal: true, heading: 'Your cart' },
  render: (args) => html`
    <ds-side-panel
      ?open=${args.open}
      heading=${args.heading}
      side="end"
      ?modal=${args.modal}
      .dismissible=${args.dismissible}
    >
      <ds-button slot="trigger" label="Open cart"></ds-button>
      <ds-text>Your cart is empty.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Checkout"></ds-button>
    </ds-side-panel>
  `,
};

export const ScrimFalse: Story = { args: { scrim: false } };

export const DismissibleFalse: Story = {
  args: { dismissible: false, modal: true, heading: 'Required filters' },
  render: (args) => html`
    <ds-side-panel
      ?open=${args.open}
      heading=${args.heading}
      ?modal=${args.modal}
      .dismissible=${args.dismissible}
    >
      <ds-button slot="trigger" label="Open filters"></ds-button>
      <ds-text>Choose at least one filter to continue.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply"></ds-button>
    </ds-side-panel>
  `,
};

export const SwipeableFalse: Story = { args: { swipeable: false } };

export const NoFooter: Story = {
  render: (args) => html`
    <ds-side-panel ?open=${args.open} heading=${args.heading}>
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
    </ds-side-panel>
  `,
};

/**
 * Renders open with its trigger and at least three focusable children so the
 * keyboard gate can verify Tab flowing trigger → panel → page, Shift+Tab
 * returning to the trigger, and Escape.
 */
export const Keyboard: Story = {
  render: () => html`
    <ds-side-panel open heading="Menu">
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
      <ds-input label="Search" name="search" value=""></ds-input>
    </ds-side-panel>
  `,
};
