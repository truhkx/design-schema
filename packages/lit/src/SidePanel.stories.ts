import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './SidePanel.js';
import './Button.js';
import './Icon.js';
import './Link.js';
import './Input.js';
import './Checkbox.js';
import './Card.js';
import './Stack.js';
import './Text.js';
import type {
  DsSidePanel,
  SidePanelSide,
  SidePanelWidth,
  SidePanelPersistent,
  SidePanelLandmark,
  SidePanelOpenChangeDetail,
} from './SidePanel.js';

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

/** The consumer side of controlled `open`: follow every `open-change`. */
function followOpenChange(event: CustomEvent<SidePanelOpenChangeDetail>): void {
  (event.currentTarget as DsSidePanel).open = event.detail.open;
}

function panel(args: SidePanelArgs, trigger: TemplateResult, body: TemplateResult, footer?: TemplateResult): TemplateResult {
  return html`
    <ds-side-panel
      .open=${args.open}
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
      @open-change=${followOpenChange}
    >
      ${trigger} ${body} ${footer ?? ''}
    </ds-side-panel>
  `;
}

const menuTrigger = html`
  <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
    <ds-icon slot="leading-icon" name="menu"></ds-icon>
  </ds-button>
`;

const navLinks = html`
  <ds-stack gap="tight">
    <ds-link href="#home" aria-current="page">Home</ds-link>
    <ds-link href="#orders">Orders</ds-link>
    <ds-link href="#settings">Settings</ds-link>
  </ds-stack>
`;

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
  render: (args) => panel(args, menuTrigger, navLinks),
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

/* role (the Lit property is `landmark`) */
export const RoleComplementary: Story = { args: { landmark: 'complementary' } };
export const RoleNavigation: Story = { args: { landmark: 'navigation' } };

/* notable states */
export const Closed: Story = { args: { open: false } };
export const HideHeading: Story = { args: { hideHeading: true } };
export const Modal: Story = { args: { modal: true } };
export const ScrimFalse: Story = { args: { scrim: false } };
export const DismissibleFalse: Story = { args: { dismissible: false } };
export const SwipeableFalse: Story = { args: { swipeable: false } };

/* examples: `open` is not in their `given`, so the panel starts closed behind its trigger. */
export const NavigationDrawer: Story = {
  args: { open: false, heading: 'Menu', hideHeading: true, landmark: 'navigation', persistent: 'content' },
};

export const Filters: Story = {
  args: { open: false, heading: 'Filters', width: 'wide' },
  render: (args) =>
    panel(
      args,
      html`<ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>`,
      html`
        <ds-stack gap="normal">
          <ds-checkbox label="In stock" name="inStock"></ds-checkbox>
          <ds-checkbox label="On sale" name="onSale"></ds-checkbox>
          <ds-checkbox label="Free shipping" name="freeShipping"></ds-checkbox>
        </ds-stack>
      `,
      html`
        <ds-button slot="footer" variant="secondary" label="Clear"></ds-button>
        <ds-button slot="footer" variant="primary" label="Apply"></ds-button>
      `,
    ),
};

export const Cart: Story = {
  args: { open: true, heading: 'Your cart', side: 'end', modal: true },
  render: (args) =>
    panel(
      args,
      html``,
      html`
        <ds-stack gap="normal">
          <ds-card inset="md"><ds-text>Notebook × 2</ds-text></ds-card>
          <ds-card inset="md"><ds-text>Pen × 1</ds-text></ds-card>
        </ds-stack>
      `,
      html`<ds-button slot="footer" variant="primary" label="Checkout"></ds-button>`,
    ),
};

export const DetailPanel: Story = {
  args: { open: true, heading: 'Order details', side: 'end', width: 'narrow', scrim: false },
  render: (args) =>
    panel(
      args,
      html``,
      html`
        <ds-stack gap="tight">
          <ds-text tone="muted">Order</ds-text>
          <ds-text>No. 1042</ds-text>
          <ds-text tone="muted">Status</ds-text>
          <ds-text>Shipped</ds-text>
        </ds-stack>
      `,
    ),
};

/** Open with its trigger and three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  render: (args) =>
    panel(
      args,
      menuTrigger,
      html`
        <ds-stack gap="tight">
          <ds-link href="#home" aria-current="page">Home</ds-link>
          <ds-link href="#orders">Orders</ds-link>
          <ds-input label="Search" name="search"></ds-input>
        </ds-stack>
      `,
    ),
};
