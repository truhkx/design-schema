import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ActionSheet.js';
import './Button.js';
import './Icon.js';
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
 * dismissal close the sheet (the `action` and `close` handles log them first). Only the Keyboard
 * story renders a trigger; every other story renders none, since there is no copy key for one.
 */
function closeSheet(event: Event): void {
  (event.currentTarget as DsActionSheet).open = false;
}

/** The Keyboard story's trigger reopens the sheet rendered right after it. */
function openSheet(event: Event): void {
  const sheet = (event.currentTarget as HTMLElement).nextElementSibling;
  if (sheet instanceof HTMLElement && sheet.localName === 'ds-action-sheet') {
    (sheet as DsActionSheet).open = true;
  }
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

/**
 * Open with its "More actions" trigger, four focusable actions and the Cancel row, for the keyboard
 * gate. The trigger is the only one in the module: it gives the wide presentation a real anchor.
 */
export const Keyboard: Story = {
  args: { open: true, heading: 'Photo.jpg', actions: PHOTO_ACTIONS },
  render: (args) => html`
    <ds-button icon-only label="More actions" @press=${openSheet}
      ><ds-icon slot="leading-icon" name="ellipsis"></ds-icon
    ></ds-button>
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
