import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ActionSheet.js';
import type { ActionSheetAction, DsActionSheet } from './ActionSheet.js';

interface ActionSheetArgs {
  open: boolean;
  heading?: string | undefined;
  actions: ActionSheetAction[];
  dismissible?: boolean | undefined;
  cancelLabel?: string | undefined;
}

const PHOTO_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
];

/**
 * The consumer's side of the controlled contract: `open` is owned here, and both a choice and a
 * dismissal close the sheet. No trigger is rendered — there is no copy key for one — so the sheet's
 * own rows and the Cancel row are the only focusable elements on the page.
 */
function closeSheet(event: Event): void {
  (event.currentTarget as DsActionSheet).open = false;
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
    actions: PHOTO_ACTIONS,
  },
  render: (args) => html`
    <ds-action-sheet
      ?open=${args.open}
      heading=${ifDefined(args.heading)}
      .actions=${args.actions}
      ?no-dismiss=${args.dismissible === false}
      cancel-label=${ifDefined(args.cancelLabel)}
      @action=${closeSheet}
      @close=${closeSheet}
    ></ds-action-sheet>
  `,
};

export default meta;
type Story = StoryObj<ActionSheetArgs>;

/** Open, with the photo-actions example's args. */
export const Default: Story = {};

/** Contextual actions on an item, with the destructive one last. */
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

/** A sheet with no heading, named by copy.defaultLabel for assistive technology. */
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

/** An action that is shown but cannot be used here, announced as disabled rather than hidden. */
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

/** No Cancel row, no handle; the scrim does nothing and Escape still reports through `close`. */
export const DismissibleFalse: Story = {
  args: { dismissible: false },
};

/** The controlled sheet with `open` false renders nothing. */
export const Closed: Story = {
  args: { open: false },
};

/** Open with four focusable actions and the Cancel row, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true, heading: 'Photo.jpg', actions: PHOTO_ACTIONS },
};
