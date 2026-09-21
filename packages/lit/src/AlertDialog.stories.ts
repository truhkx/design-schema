import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './AlertDialog.js';
import './Button.js';
import type { AlertDialogTone, DsAlertDialog } from './AlertDialog.js';

interface AlertDialogArgs {
  open: boolean;
  heading: string;
  description: string;
  tone?: AlertDialogTone | undefined;
  confirmLabel: string;
  cancelLabel?: string | undefined;
  confirmDisabled?: boolean | undefined;
}

/** The consumer owns `open`: both answers close the story's dialog. */
function closeAlertDialog(event: Event): void {
  (event.currentTarget as DsAlertDialog).open = false;
}

/**
 * The trigger, as a real consumer would write it: focus returns here when the dialog closes. It is
 * labelled with the `heading` text, never `confirmLabel`, so no second button shares Confirm's name.
 */
function openAlertDialog(event: Event): void {
  const dialog = (event.currentTarget as HTMLElement).nextElementSibling as DsAlertDialog | null;
  if (dialog) {
    dialog.open = true;
  }
}

const meta: Meta<AlertDialogArgs> = {
  title: 'AlertDialog/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['confirm', 'cancel'] },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['danger', 'warning', 'info'] },
  },
  args: {
    open: true,
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    tone: 'danger',
    confirmLabel: 'Delete files',
    confirmDisabled: false,
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openAlertDialog}></ds-button>
    <ds-alert-dialog
      ?open=${args.open}
      heading=${args.heading}
      description=${args.description}
      tone=${args.tone ?? 'danger'}
      confirm-label=${args.confirmLabel}
      cancel-label=${ifDefined(args.cancelLabel)}
      ?confirm-disabled=${args.confirmDisabled ?? false}
      @confirm=${closeAlertDialog}
      @cancel=${closeAlertDialog}
    ></ds-alert-dialog>
  `,
};

export default meta;
type Story = StoryObj<AlertDialogArgs>;

export const Default: Story = {};

/* tone */
export const ToneDanger: Story = { args: { tone: 'danger' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneInfo: Story = { args: { tone: 'info' } };

/* notable states */
export const ConfirmDisabled: Story = { args: { confirmDisabled: true } };

export const Closed: Story = { args: { open: false } };

/**
 * Open with its trigger. The dialog has exactly two focusable children, Cancel and Confirm — there
 * is no slot for more — so Tab wraps across those two and the trigger sits behind the inert page.
 */
export const Keyboard: Story = { args: { open: true } };

/* examples */
export const DeleteFiles: Story = {
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files',
  },
};

export const LeaveWithoutSaving: Story = {
  args: {
    open: true,
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Keep editing',
  },
};

export const TypedConfirmation: Story = {
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    confirmDisabled: true,
  },
};

export const PublishToTheTeam: Story = {
  args: {
    open: true,
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish',
  },
};
