import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './AlertDialog.js';
import type { AlertDialogTone } from './AlertDialog.js';

interface AlertDialogArgs {
  open: boolean;
  heading: string;
  description: string;
  tone: AlertDialogTone;
  confirmLabel: string;
  cancelLabel?: string | undefined;
  confirmDisabled: boolean;
}

const meta: Meta<AlertDialogArgs> = {
  title: 'AlertDialog/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['confirm', 'cancel'] },
  },
  argTypes: {
    tone: { control: 'select', options: ['danger', 'warning', 'info'] },
  },
  args: {
    open: true,
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    tone: 'danger',
    confirmLabel: 'Delete files',
    cancelLabel: undefined,
    confirmDisabled: false,
  },
  render: (args) => html`
    <ds-alert-dialog
      ?open=${args.open}
      heading=${args.heading}
      description=${args.description}
      tone=${args.tone}
      confirm-label=${args.confirmLabel}
      cancel-label=${ifDefined(args.cancelLabel)}
      ?confirm-disabled=${args.confirmDisabled}
    ></ds-alert-dialog>
  `,
};

export default meta;
type Story = StoryObj<AlertDialogArgs>;

export const Default: Story = {};

/* tone */
export const ToneDanger: Story = { args: { tone: 'danger' } };
export const ToneWarning: Story = {
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes will be lost.',
    confirmLabel: 'Leave page',
  },
};
export const ToneInfo: Story = {
  args: {
    tone: 'info',
    heading: 'Switch workspaces?',
    description: 'You will need to sign in again to switch back.',
    confirmLabel: 'Switch workspace',
  },
};

export const CancelLabel: Story = {
  args: {
    heading: 'Discard draft?',
    description: 'Your draft will be permanently deleted.',
    confirmLabel: 'Discard draft',
    cancelLabel: 'Keep editing',
  },
};

export const ConfirmDisabled: Story = {
  args: { confirmDisabled: true },
};

/**
 * Renders open with its trigger and at least three focusable children so the
 * keyboard gate can verify Tab/Shift+Tab wrapping and Escape.
 */
export const Keyboard: Story = {
  render: () => html`
    <button type="button" id="alert-dialog-trigger">Delete files</button>
    <ds-alert-dialog
      open
      tone="danger"
      heading="Delete 3 files?"
      description="They will be removed from all shared folders. This cannot be undone."
      confirm-label="Delete files"
    ></ds-alert-dialog>
  `,
};
