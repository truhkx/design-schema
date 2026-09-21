import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
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
  /** Omitted, the panel is uncontrolled: it starts closed and its trigger toggles it. */
  open?: boolean | undefined;
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

/**
 * The consumer side of controlled `open`: a story given `open` owns the state and
 * follows every `open-change`. An uncontrolled story keeps its own state.
 */
function followOpenChange(event: CustomEvent<SidePanelOpenChangeDetail>): void {
  const panel = event.currentTarget as DsSidePanel;
  if (panel.open !== undefined) {
    panel.open = event.detail.open;
  }
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
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-link href="#settings" label="Settings"></ds-link>
      </ds-stack>
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

/* role (the Lit property is `landmark`: a custom element inherits `Element.role`) */
export const RoleComplementary: Story = { args: { landmark: 'complementary' } };
export const RoleNavigation: Story = { args: { landmark: 'navigation' } };

/* notable states */
export const Open: Story = { args: { open: true } };
export const Modal: Story = { args: { open: true, modal: true } };
export const NoScrim: Story = { args: { open: true, scrim: false } };
export const NotDismissible: Story = { args: { open: true, dismissible: false } };
export const HiddenHeading: Story = { args: { open: true, hideHeading: true } };
/** hideHeading with no close button: the header part is not rendered and the hidden title leads the column. */
export const HiddenHeadingNotDismissible: Story = {
  args: { open: true, hideHeading: true, dismissible: false },
};

/* examples — each starts from blank args, never from Default's or the meta args: a prop absent from
   the doc's `given` takes its default, so an example with no `open` renders uncontrolled and closed. */

/** The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list. */
export const NavigationDrawer: Story = {
  args: { heading: 'Menu', hideHeading: true, landmark: 'navigation', persistent: 'content' },
  render: (args) => html`
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
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-link href="#settings" label="Settings"></ds-link>
      </ds-stack>
    </ds-side-panel>
  `,
};

/** A wide filter panel beside a results page, ending in an action row. */
export const Filters: Story = {
  args: { heading: 'Filters', width: 'wide' },
  render: (args) => html`
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
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      <ds-stack gap="normal">
        <ds-checkbox name="in-stock" label="In stock"></ds-checkbox>
        <ds-checkbox name="free-shipping" label="Free shipping"></ds-checkbox>
        <ds-checkbox name="on-sale" label="On sale"></ds-checkbox>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear"></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply"></ds-button>
    </ds-side-panel>
  `,
};

/** A checkout panel from the end edge that must be finished or dismissed, so it is modal. */
export const Cart: Story = {
  args: { open: true, heading: 'Your cart', side: 'end', modal: true },
  render: (args) => html`
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
      <ds-stack gap="normal">
        <ds-card heading="Linen shirt"><ds-text>1 × $48.00</ds-text></ds-card>
        <ds-card heading="Canvas tote"><ds-text>2 × $22.00</ds-text></ds-card>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Checkout"></ds-button>
    </ds-side-panel>
  `,
};

/** A narrow detail panel that should feel like part of the page, so it has no scrim. */
export const DetailPanel: Story = {
  args: { open: true, heading: 'Order details', side: 'end', width: 'narrow', scrim: false },
  render: (args) => html`
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
      <ds-stack gap="tight">
        <ds-text tone="muted">Order</ds-text>
        <ds-text>#10482</ds-text>
        <ds-text tone="muted">Status</ds-text>
        <ds-text>Shipped</ds-text>
      </ds-stack>
    </ds-side-panel>
  `,
};

/** Open with its trigger and three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => html`
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
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-input label="Search" name="search"></ds-input>
      </ds-stack>
    </ds-side-panel>
  `,
};
