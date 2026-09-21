import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Toast.js';
import './Button.js';
import { dismiss, toast, type ToastDuration, type ToastTone } from './Toast.js';

interface ToastArgs {
  message: string;
  tone: ToastTone;
  actionLabel?: string | undefined;
  duration?: ToastDuration | undefined;
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
    dismissible: true,
  },
  // Toasts shown through `toast()` outlive the story; clear them on cleanup.
  beforeEach: () => () => dismiss(),
  render: (args) => html`
    <ds-toast
      message=${args.message}
      tone=${args.tone}
      action-label=${ifDefined(args.actionLabel)}
      duration=${ifDefined(args.duration)}
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
/* No `duration`: an action already makes the toast persistent, and passing `short`/`long` would warn. */
export const BackgroundResult: Story = { args: { message: 'Export ready', actionLabel: 'View' } };
export const FailedUpload: Story = {
  args: { message: 'Upload failed', tone: 'danger', actionLabel: 'Retry', duration: 'persistent' },
};

/* notable states */
export const NotDismissible: Story = { args: { dismissible: false } };

/** The imperative API: each press shows the story's args as a toast in the auto-created region. */
export const Imperative: Story = {
  render: (args) => html`
    <ds-button
      label="Show toast"
      @press=${() =>
        void toast({
          message: args.message,
          tone: args.tone,
          actionLabel: args.actionLabel,
          duration: args.duration,
          dismissible: args.dismissible,
          toastId: args.toastId,
        })}
    ></ds-button>
  `,
};

/**
 * The region with two persistent action toasts — four focusable buttons — and a focusable element
 * on each side of it, so `F6` has somewhere to come from and return to, and `Tab` somewhere to
 * leave for.
 *
 * The first is the toast the keyboard rules act on; the second is `danger`, so it announces through
 * `role="alert"` rather than `status`. That keeps exactly one `role="status"` on the page: Escape
 * dismisses the toast holding focus and only that one, which a `getByRole('status')` locator can
 * only observe when no other status toast is left to take its place.
 */
export const Keyboard: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-toast-region style="position: static; inset: auto;">
        <ds-toast message="3 files moved to Archive" action-label="Undo" duration="persistent"></ds-toast>
        <ds-toast message="Upload failed" tone="danger" action-label="Retry" duration="persistent"></ds-toast>
      </ds-toast-region>
      <button type="button">After</button>
    </div>
  `,
};
