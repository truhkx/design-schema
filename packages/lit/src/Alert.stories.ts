import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Alert.js';
import './Link.js';
import './Text.js';
import type { AlertLive, AlertTone } from './Alert.js';

interface AlertArgs {
  tone: AlertTone;
  heading?: string | undefined;
  live: AlertLive;
  dismissible: boolean;
  /** The default slot (doc prop `children`), as plain text. */
  children: string;
}

const meta: Meta<AlertArgs> = {
  title: 'Alert/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['dismiss'] },
  },
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    live: { control: 'select', options: ['status', 'alert', 'off'] },
    dismissible: { control: 'boolean' },
    heading: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    tone: 'info',
    live: 'status',
    dismissible: false,
    children: 'Some features are unavailable while you are offline.',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert
        tone=${args.tone}
        live=${args.live}
        heading=${ifDefined(args.heading)}
        ?dismissible=${args.dismissible}
        @dismiss=${(event: Event) => (event.target as HTMLElement).remove()}
        >${args.children}</ds-alert
      >
    </div>
  `,
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneDanger: Story = { args: { tone: 'danger' } };

/* live */
export const LiveStatus: Story = { args: { live: 'status' } };
export const LiveAlert: Story = { args: { live: 'alert' } };
export const LiveOff: Story = { args: { live: 'off' } };

/* dismissible */
export const Dismissible: Story = { args: { dismissible: true } };

/* examples */
export const BlockingError: Story = {
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    children: 'Your card was declined. Try another card or contact your bank.',
  },
};
export const Saved: Story = {
  args: {
    tone: 'success',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.',
  },
};
export const DismissibleNotice: Story = {
  args: {
    tone: 'info',
    dismissible: true,
    children: 'Some features are unavailable while you are offline.',
  },
};
export const PresentAtLoad: Story = {
  args: {
    tone: 'warning',
    live: 'off',
    heading: 'Trial ends in three days',
    children: 'Add a payment method to keep your workspace.',
  },
};

/* notable states */
export const WithLink: Story = {
  args: { tone: 'warning', heading: 'Trial ends in three days' },
  render: (args) => html`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=${args.tone} live=${args.live} heading=${ifDefined(args.heading)} ?dismissible=${args.dismissible}>
        <ds-text
          >Add a payment method to keep your workspace.
          <ds-link href="#billing" label="Go to billing"></ds-link></ds-text
        >
      </ds-alert>
    </div>
  `,
};
