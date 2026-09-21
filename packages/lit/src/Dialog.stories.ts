import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
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

/** The trigger, as a real consumer would write it: focus returns here when the dialog closes. */
function openDialog(event: Event): void {
  const dialog = (event.currentTarget as HTMLElement).nextElementSibling as DsDialog | null;
  if (dialog) {
    dialog.open = true;
  }
}

const meta: Meta<DialogArgs> = {
  title: 'Dialog/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['close', 'opened'] },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    initialFocus: { control: 'inline-radio', options: ['first', 'title', 'close'] },
  },
  args: {
    open: true,
    heading: 'Rename project',
    hideHeading: false,
    size: 'md',
    dismissible: true,
    initialFocus: 'first',
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openDialog}></ds-button>
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
      <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
      <ds-button slot="footer" variant="primary" label="Rename" @press=${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeDialog}></ds-button>
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

/* notable states */
export const HideHeading: Story = { args: { hideHeading: true } };

/** The description is one sentence of consequence under the title, and the accessible description. */
export const WithDescription: Story = {
  args: { description: 'Everyone with access will see the new name.' },
};

export const NotDismissible: Story = { args: { dismissible: false } };

export const Closed: Story = { args: { open: false } };

/** Open with its trigger and more than three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openDialog}></ds-button>
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
      <ds-stack gap="normal">
        <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
        <ds-input label="Slug" name="slug" default-value="q3-roadmap"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Rename" @press=${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeDialog}></ds-button>
    </ds-dialog>
  `,
};

/* examples */
export const RenameProject: Story = {
  args: { open: true, heading: 'Rename project' },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openDialog}></ds-button>
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      size=${args.size ?? 'md'}
      initial-focus=${args.initialFocus ?? 'first'}
      @close=${closeDialog}
    >
      <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
      <ds-button slot="footer" variant="primary" label="Rename" @press=${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeDialog}></ds-button>
    </ds-dialog>
  `,
};

export const InvitePeople: Story = {
  args: { open: true, heading: 'Invite people', size: 'sm' },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openDialog}></ds-button>
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      size=${args.size ?? 'md'}
      initial-focus=${args.initialFocus ?? 'first'}
      @close=${closeDialog}
    >
      <ds-stack gap="normal">
        <ds-input type="email" label="Email" name="email"></ds-input>
        <ds-select
          label="Role"
          name="role"
          .defaultValue=${'member'}
          .options=${[
            { value: 'member', label: 'Member' },
            { value: 'admin', label: 'Admin' },
          ]}
        ></ds-select>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Send invites" @press=${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeDialog}></ds-button>
    </ds-dialog>
  `,
};

export const MustBeAnswered: Story = {
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    dismissible: false,
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openDialog}></ds-button>
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      description=${ifDefined(args.description)}
      size=${args.size ?? 'md'}
      ?no-dismiss=${args.dismissible === false}
      initial-focus=${args.initialFocus ?? 'first'}
      @close=${closeDialog}
    >
      <ds-radio-group
        label="Plan"
        name="plan"
        .options=${[
          { value: 'starter', label: 'Starter' },
          { value: 'team', label: 'Team' },
          { value: 'business', label: 'Business' },
        ]}
      ></ds-radio-group>
      <ds-button slot="footer" variant="primary" label="Continue" @press=${closeDialog}></ds-button>
    </ds-dialog>
  `,
};

export const ReadingDialog: Story = {
  args: { open: true, heading: 'Terms of service', size: 'lg', initialFocus: 'title' },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openDialog}></ds-button>
    <ds-dialog
      ?open=${args.open}
      heading=${args.heading}
      size=${args.size ?? 'md'}
      initial-focus=${args.initialFocus ?? 'first'}
      @close=${closeDialog}
    >
      <ds-stack gap="normal">
        <ds-text>These terms govern your use of the service and any content you create with it.</ds-text>
        <ds-text
          >You keep ownership of your content. You grant us the rights needed to host and display it to the people you
          share it with.</ds-text
        >
        <ds-text>We may update these terms. When we do, we will tell you before the changes take effect.</ds-text>
        <ds-text>You can close your account at any time. Your content is deleted thirty days after closure.</ds-text>
      </ds-stack>
    </ds-dialog>
  `,
};
