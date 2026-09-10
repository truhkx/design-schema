import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Dialog.js';
import './Button.js';
import './Input.js';
import './Text.js';
import type { DialogInitialFocus, DialogSize } from './Dialog.js';

interface DialogArgs {
  open: boolean;
  heading: string;
  description?: string;
  hideHeading: boolean;
  size: DialogSize;
  dismissible: boolean;
  initialFocus: DialogInitialFocus;
}

const meta: Meta<DialogArgs> = {
  title: 'Dialog/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['close', 'opened'] },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    initialFocus: { control: 'select', options: ['first', 'title', 'close'] },
  },
  args: {
    open: true,
    heading: 'Rename project',
    description: 'This changes the project name everywhere it appears.',
    hideHeading: false,
    size: 'md',
    dismissible: true,
    initialFocus: 'first',
  },
  render: (args) => html`
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      description=${ifDefined(args.description)}
      ?hide-heading=${args.hideHeading}
      size=${args.size}
      ?no-dismiss=${!args.dismissible}
      initial-focus=${args.initialFocus}
    >
      <ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>
      <ds-button slot="footer" variant="primary" size="sm" label="Rename"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-dialog>
  `,
};

export default meta;
type Story = StoryObj<DialogArgs>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* initialFocus */
export const InitialFocusFirst: Story = { args: { initialFocus: 'first' } };
export const InitialFocusTitle: Story = { args: { initialFocus: 'title' } };
export const InitialFocusClose: Story = { args: { initialFocus: 'close' } };

export const DismissibleFalse: Story = {
  args: { dismissible: false },
  render: (args) => html`
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      description="You must choose an option below to continue."
      size=${args.size}
      ?no-dismiss=${!args.dismissible}
      initial-focus=${args.initialFocus}
    >
      <ds-text>Your session is about to expire.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Stay signed in"></ds-button>
      <ds-button slot="footer" variant="secondary" size="sm" label="Sign out"></ds-button>
    </ds-dialog>
  `,
};

export const NoDescription: Story = {
  args: { description: undefined },
};

/* hideHeading */
export const HideHeadingTrue: Story = { args: { hideHeading: true } };

export const NoFooter: Story = {
  render: (args) => html`
    <ds-dialog ?open=${args.open} heading="Keyboard shortcuts" size=${args.size}>
      <ds-text>Press "?" anywhere to reopen this list.</ds-text>
    </ds-dialog>
  `,
};

/**
 * Renders open with its trigger and at least three focusable children so the
 * keyboard gate can verify Tab/Shift+Tab wrapping and Escape.
 */
export const Keyboard: Story = {
  render: () => html`
    <button type="button" id="dialog-trigger">Rename</button>
    <ds-dialog open heading="Rename project" description="This changes the project name everywhere it appears.">
      <ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>
      <ds-button slot="footer" variant="primary" size="sm" label="Rename"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-dialog>
  `,
};
