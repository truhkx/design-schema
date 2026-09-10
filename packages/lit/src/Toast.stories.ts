import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Toast.js';
import type { ToastDuration, ToastTone } from './Toast.js';

interface ToastArgs {
  message: string;
  tone: ToastTone;
  actionLabel?: string;
  duration: ToastDuration;
  dismissible: boolean;
}

const meta: Meta<ToastArgs> = {
  title: 'Toast/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['action', 'dismiss'] },
  },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'success', 'warning', 'danger'] },
    duration: { control: 'select', options: ['short', 'long', 'persistent'] },
    dismissible: { control: 'boolean' },
  },
  args: {
    message: 'Message sent',
    tone: 'neutral',
    duration: 'short',
    dismissible: true,
  },
  render: (args) => html`
    <ds-toast
      message=${args.message}
      tone=${args.tone}
      action-label=${ifDefined(args.actionLabel)}
      duration=${args.duration}
      ?dismissible=${args.dismissible}
    ></ds-toast>
  `,
};

export default meta;
type Story = StoryObj<ToastArgs>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral', message: 'Preferences updated' } };
export const ToneSuccess: Story = { args: { tone: 'success', message: 'Message sent' } };
export const ToneWarning: Story = { args: { tone: 'warning', message: 'Connection is unstable' } };
export const ToneDanger: Story = {
  args: { tone: 'danger', message: 'Export failed', duration: 'persistent' },
};

/* duration */
export const DurationShort: Story = { args: { duration: 'short' } };
export const DurationLong: Story = { args: { duration: 'long' } };
export const DurationPersistent: Story = { args: { duration: 'persistent' } };

/* notable states */
export const WithAction: Story = {
  args: { message: '3 files moved to Archive', actionLabel: 'Undo', duration: 'persistent' },
};

export const NotDismissible: Story = {
  args: { message: 'Syncing…', dismissible: false },
};

/**
 * Renders present alongside its region and three focusable siblings, so the
 * keyboard gate can verify `F6` moves focus into the toast's action and
 * dismiss buttons, `Escape` dismisses and returns focus, and `Tab` moves
 * between the two buttons and out again.
 */
export const Keyboard: Story = {
  render: () => html`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-toast-region style="position: static; inset: auto;">
        <ds-toast message="3 files moved to Archive" action-label="Undo" duration="persistent"></ds-toast>
      </ds-toast-region>
      <button type="button">After</button>
    </div>
  `,
};
