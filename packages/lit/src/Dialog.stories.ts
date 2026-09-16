import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Dialog.js';
import './Button.js';
import './Input.js';
import './Text.js';
import './RadioGroup.js';
import './Select.js';
import './Stack.js';
import type { DsDialog, DialogInitialFocus, DialogSize } from './Dialog.js';

interface DialogArgs {
  open: boolean;
  heading: string;
  description?: string | undefined;
  hideHeading?: boolean | undefined;
  size?: DialogSize | undefined;
  dismissible?: boolean | undefined;
  initialFocus?: DialogInitialFocus | undefined;
}

/** The consumer owns `open`: every close request (and every footer action) closes the story's dialog. */
function closeDialog(event: Event): void {
  const dialog = (event.currentTarget as HTMLElement).closest('ds-dialog') as DsDialog | null;
  if (dialog) {
    dialog.open = false;
  }
}

function openDialog(event: Event): void {
  const dialog = (event.currentTarget as HTMLElement).nextElementSibling as DsDialog | null;
  if (dialog) {
    dialog.open = true;
  }
}

function renderDialog(args: DialogArgs, body: TemplateResult, footer: TemplateResult | undefined): TemplateResult {
  return html`
    <ds-button label="Open dialog" @press=${openDialog}></ds-button>
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      description=${ifDefined(args.description)}
      ?hide-heading=${args.hideHeading ?? false}
      size=${args.size ?? 'md'}
      ?no-dismiss=${args.dismissible === false}
      initial-focus=${args.initialFocus ?? 'first'}
      @close=${closeDialog}
    >
      ${body} ${footer ?? ''}
    </ds-dialog>
  `;
}

const renameBody: TemplateResult = html`<ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>`;
const renameFooter: TemplateResult = html`
  <ds-button slot="footer" variant="primary" label="Rename" @press=${closeDialog}></ds-button>
  <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeDialog}></ds-button>
`;

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
    hideHeading: false,
    size: 'md',
    dismissible: true,
    initialFocus: 'first',
  },
  render: (args) => renderDialog(args, renameBody, renameFooter),
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

/* notable states */
export const WithDescription: Story = {
  args: { description: 'The new name appears everywhere the project is listed.' },
};
export const HideHeading: Story = { args: { hideHeading: true } };
export const NotDismissible: Story = { args: { dismissible: false } };
export const NoFooter: Story = {
  render: (args) =>
    renderDialog(args, html`<ds-text>Press the question mark key anywhere to reopen this list.</ds-text>`, undefined),
  args: { heading: 'Keyboard shortcuts' },
};

/* examples */
export const RenameProject: Story = {
  args: { open: true, heading: 'Rename project' },
  render: (args) => renderDialog(args, renameBody, renameFooter),
};

export const InvitePeople: Story = {
  args: { open: true, heading: 'Invite people', size: 'sm' },
  render: (args) =>
    renderDialog(
      args,
      html`
        <ds-stack gap="normal">
          <ds-input type="email" label="Email" name="email"></ds-input>
          <ds-select
            label="Role"
            name="role"
            .options=${[
              { value: 'member', label: 'Member' },
              { value: 'admin', label: 'Admin' },
            ]}
          ></ds-select>
        </ds-stack>
      `,
      html`
        <ds-button slot="footer" variant="primary" label="Send invites" @press=${closeDialog}></ds-button>
        <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeDialog}></ds-button>
      `,
    ),
};

export const MustBeAnswered: Story = {
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    dismissible: false,
  },
  render: (args) =>
    renderDialog(
      args,
      html`<ds-radio-group
        label="Plan"
        name="plan"
        .options=${[
          { value: 'free', label: 'Free' },
          { value: 'team', label: 'Team' },
          { value: 'business', label: 'Business' },
        ]}
      ></ds-radio-group>`,
      html`<ds-button slot="footer" variant="primary" label="Continue" @press=${closeDialog}></ds-button>`,
    ),
};

export const ReadingDialog: Story = {
  args: { open: true, heading: 'Terms of service', size: 'lg', initialFocus: 'title' },
  render: (args) =>
    renderDialog(
      args,
      html`
        <ds-stack gap="normal">
          <ds-text>These terms govern your use of the service and any content you create with it.</ds-text>
          <ds-text>You keep ownership of your content. You grant us the rights needed to host and display it.</ds-text>
          <ds-text>We may update these terms. We will tell you before changes take effect.</ds-text>
          <ds-text>You can close your account at any time. Your content is deleted thirty days later.</ds-text>
        </ds-stack>
      `,
      undefined,
    ),
};

/**
 * Open with its trigger and at least three focusable children (the close button, the input and
 * two footer buttons), so the keyboard gate can check Escape and Tab / Shift+Tab wrapping.
 */
export const Keyboard: Story = {
  render: (args) => renderDialog(args, renameBody, renameFooter),
};
