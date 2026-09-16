import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Toast.js';
import type { ToastDuration, ToastTone } from './Toast.js';

interface ToastArgs {
  message: string;
  tone: ToastTone;
  actionLabel?: string | undefined;
  duration: ToastDuration;
  dismissible: boolean;
  toastId?: string | undefined;
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
      toast-id=${ifDefined(args.toastId)}
      ?no-dismiss=${!args.dismissible}
    ></ds-toast>
  `,
};

export default meta;
type Story = StoryObj<ToastArgs>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneDanger: Story = { args: { tone: 'danger' } };

/* duration */
export const DurationShort: Story = { args: { duration: 'short' } };
export const DurationLong: Story = { args: { duration: 'long' } };
export const DurationPersistent: Story = { args: { duration: 'persistent' } };

/* examples */
export const UndoADelete: Story = {
  args: { message: '3 files moved to Archive', actionLabel: 'Undo', duration: 'persistent' },
};
export const Saved: Story = { args: { message: 'Changes saved', tone: 'success' } };
export const BackgroundResult: Story = {
  args: { message: 'Export ready', actionLabel: 'View', duration: 'long' },
};
export const FailedUpload: Story = {
  args: { message: 'Upload failed', tone: 'danger', actionLabel: 'Retry', duration: 'persistent' },
};

/* notable states */
export const NotDismissible: Story = { args: { dismissible: false } };

/**
 * A toast present in its region with focusable content before and after it,
 * so the keyboard gate can check that `F6` moves focus to the toast's action
 * button and back, `Escape` dismisses, and `Tab` moves between the action and
 * dismiss buttons and out of the region.
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
