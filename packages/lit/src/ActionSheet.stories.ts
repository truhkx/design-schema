import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ActionSheet.js';
import './Button.js';
import type { ActionSheetAction, DsActionSheet } from './ActionSheet.js';

interface ActionSheetArgs {
  open: boolean;
  heading?: string | undefined;
  actions: ActionSheetAction[];
  dismissible?: boolean | undefined;
  cancelLabel?: string | undefined;
}

/** The consumer's side of the controlled contract: a choice or a dismissal closes the sheet. */
function closeSheet(event: Event): void {
  (event.currentTarget as DsActionSheet).open = false;
}

function openSheet(event: Event): void {
  const sheet = (event.currentTarget as HTMLElement).nextElementSibling as DsActionSheet | null;
  if (sheet) {
    sheet.open = true;
  }
}

function renderSheet(args: ActionSheetArgs): TemplateResult {
  return html`
    <ds-button label="More actions" variant="secondary" @press=${openSheet}></ds-button>
    <ds-action-sheet
      ?open=${args.open}
      heading=${ifDefined(args.heading)}
      .actions=${args.actions}
      ?no-dismiss=${args.dismissible === false}
      cancel-label=${ifDefined(args.cancelLabel)}
      @action=${closeSheet}
      @close=${closeSheet}
    ></ds-action-sheet>
  `;
}

const meta: Meta<ActionSheetArgs> = {
  title: 'ActionSheet/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['action', 'close'] },
  },
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: [
      { id: 'share', label: 'Share', icon: 'external' },
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
    ],
    dismissible: true,
  },
  render: renderSheet,
};

export default meta;
type Story = StoryObj<ActionSheetArgs>;

export const Default: Story = {};

export const Closed: Story = { args: { open: false } };

export const DismissibleFalse: Story = { args: { dismissible: false } };

/* examples */

export const PhotoActions: Story = {
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: [
      { id: 'share', label: 'Share', icon: 'external' },
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
    ],
  },
};

export const UnnamedSheet: Story = {
  args: {
    open: true,
    heading: undefined,
    actions: [
      { id: 'copy', label: 'Copy link' },
      { id: 'open', label: 'Open in new tab' },
    ],
  },
};

export const WithAnUnavailableAction: Story = {
  args: {
    open: true,
    heading: 'Invoice 4821',
    cancelLabel: 'Not now',
    actions: [
      { id: 'download', label: 'Download' },
      { id: 'void', label: 'Void invoice', tone: 'danger', disabled: true },
    ],
  },
};

/**
 * Open with its trigger and four enabled actions plus the Cancel row, so the keyboard gate can check
 * arrow wrapping, Home/End, Enter/Space and Escape. Choosing or dismissing closes it; the trigger reopens.
 */
export const Keyboard: Story = {
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: [
      { id: 'share', label: 'Share', icon: 'external' },
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
    ],
  },
};
