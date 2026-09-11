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
  body: string;
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
  },
  args: {
    tone: 'info',
    heading: 'Changes saved',
    live: 'off',
    dismissible: false,
    body: 'Your notification preferences apply to every device you are signed in on.',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert
        tone=${args.tone}
        live=${args.live}
        heading=${ifDefined(args.heading)}
        ?dismissible=${args.dismissible}
        @dismiss=${(event: Event) => (event.target as HTMLElement).remove()}
      >
        <ds-text>${args.body}</ds-text>
      </ds-alert>
    </div>
  `,
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = {
  args: { tone: 'info', heading: 'Scheduled maintenance', body: 'Sync pauses on Sunday from 02:00 to 03:00 UTC.' },
};
export const ToneSuccess: Story = {
  args: { tone: 'success', heading: 'Changes saved', body: 'Your preferences are up to date.' },
};
export const ToneWarning: Story = {
  args: {
    tone: 'warning',
    heading: 'Trial ends in 3 days',
    body: 'Add a payment method to keep your workspace after the trial.',
  },
};
export const ToneDanger: Story = {
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    body: 'The card ending in 4242 was declined. Update the card or try another one.',
  },
};

/* live */
export const LiveStatus: Story = { args: { live: 'status', tone: 'success' } };
export const LiveAlert: Story = { args: { live: 'alert', tone: 'danger', heading: 'Payment failed' } };
export const LiveOff: Story = { args: { live: 'off' } };

/* boolean states */
export const DismissibleTrue: Story = { args: { dismissible: true } };

export const WithoutHeading: Story = {
  args: { heading: undefined, body: 'You are offline. Changes will sync when you reconnect.' },
};

export const WithLink: Story = {
  render: (args) => html`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=${args.tone} live=${args.live} heading="Trial ends in 3 days" ?dismissible=${args.dismissible}>
        <ds-text
          >Add a payment method to keep your workspace.
          <ds-link href="#billing" label="Go to billing"></ds-link></ds-text
        >
      </ds-alert>
    </div>
  `,
};

export const RichHeading: Story = {
  render: (args) => html`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=${args.tone} live=${args.live} ?dismissible=${args.dismissible}>
        <span slot="heading">2 of 3 invitations sent</span>
        <ds-text>One address was rejected by the recipient's server.</ds-text>
      </ds-alert>
    </div>
  `,
};
